import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { Unavailable } from "@/lib/server/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { AVATAR_STYLE, avatarSeeds, renderAvatarSvg } from "./dicebear";
import type { AvatarChoice } from "./types";

const BUCKET = "avatars";
const PREVIEW_COUNT = 12;
const EXTENSION: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

export function getAvatarChoices(userId: string, page = 0): AvatarChoice[] {
	return avatarSeeds(`${userId}:${page}`, PREVIEW_COUNT).map(seed => ({
		seed,
		dataUri: `data:image/svg+xml;base64,${Buffer.from(renderAvatarSvg(seed)).toString("base64")}`,
	}));
}

function publicUrl(path: string): string {
	const { data } = getSupabaseAdmin().storage.from(BUCKET).getPublicUrl(path);
	return data.publicUrl;
}

/** Ten changes must leave one object, not ten. An OAuth picture lives on
 *  Google, so it is forgotten rather than deleted. */
async function removePreviousAvatar(userId: string, current: string | null) {
	if (!current) return;
	const marker = `/${BUCKET}/${userId}/`;
	const at = current.indexOf(marker);
	if (at === -1) return;
	const path = current.slice(at + BUCKET.length + 2);
	await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
}

async function currentImage(userId: string): Promise<string | null> {
	const [row] = await getDb()
		.select({ image: profiles.image })
		.from(profiles)
		.where(eq(profiles.id, userId))
		.limit(1);
	return row?.image ?? null;
}

async function commitAvatar(userId: string, path: string): Promise<string> {
	const previous = await currentImage(userId);
	const url = publicUrl(path);

	await getDb().update(profiles).set({ image: url }).where(eq(profiles.id, userId));
	await removePreviousAvatar(userId, previous);

	return url;
}

/** The SVG is produced here and never accepted from the browser: the bucket is
 *  public, so bytes the client chose would be active content we host. */
export async function setGeneratedAvatar(
	userId: string,
	seed: string
): Promise<string> {
	const path = `${userId}/${AVATAR_STYLE}-${crypto.randomUUID()}.svg`;

	const { error } = await getSupabaseAdmin()
		.storage.from(BUCKET)
		.upload(path, renderAvatarSvg(seed), {
			contentType: "image/svg+xml",
			upsert: false,
		});

	if (error) throw new Unavailable("Non è stato possibile salvare l'avatar. Riprova.");

	return commitAvatar(userId, path);
}

/** The bucket has no write policy, so a signed token is the only way in — and
 *  the path is the server's to choose, never the client's. */
export async function createAvatarUploadUrl(userId: string, contentType: string) {
	const path = `${userId}/${crypto.randomUUID()}.${EXTENSION[contentType] ?? "bin"}`;

	const { data, error } = await getSupabaseAdmin()
		.storage.from(BUCKET)
		.createSignedUploadUrl(path);

	if (error || !data) {
		throw new Unavailable("Non è stato possibile preparare il caricamento. Riprova.");
	}

	return { path, token: data.token };
}

export async function confirmUploadedAvatar(
	userId: string,
	path: string
): Promise<string> {
	if (!path.startsWith(`${userId}/`)) {
		throw new Unavailable("Percorso non valido.");
	}

	const { error } = await getSupabaseAdmin()
		.storage.from(BUCKET)
		.list(userId, { search: path.slice(userId.length + 1) });

	if (error) throw new Unavailable("Caricamento non trovato. Riprova.");

	return commitAvatar(userId, path);
}

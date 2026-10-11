import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { Unavailable } from "@/lib/server/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { AVATAR_STYLE, avatarSeeds, renderAvatarSvg } from "./dicebear";
import type { AvatarChoice } from "./types";

const GENERATED_BUCKET = "avatars";
// Raster only, so a file the browser chose can never be served as active content.
const UPLOAD_BUCKET = "avatar-uploads";
const PREVIEW_COUNT = 12;
const EXTENSION: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};
const RASTER_TYPES = new Set(Object.keys(EXTENSION));

export function getAvatarChoices(userId: string, page = 0): AvatarChoice[] {
	return avatarSeeds(`${userId}:${page}`, PREVIEW_COUNT).map(seed => ({
		seed,
		dataUri: `data:image/svg+xml;base64,${Buffer.from(renderAvatarSvg(seed)).toString("base64")}`,
	}));
}

function publicUrl(bucket: string, path: string): string {
	const { data } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}

/** An OAuth picture lives on Google, so it is forgotten instead of deleted. */
async function removePreviousAvatar(userId: string, current: string | null) {
	if (!current) return;
	for (const bucket of [GENERATED_BUCKET, UPLOAD_BUCKET]) {
		const marker = `/${bucket}/${userId}/`;
		const at = current.indexOf(marker);
		if (at === -1) continue;
		const path = current.slice(at + bucket.length + 2);
		await getSupabaseAdmin().storage.from(bucket).remove([path]);
		return;
	}
}

async function currentImage(userId: string): Promise<string | null> {
	const [row] = await getDb()
		.select({ image: profiles.image })
		.from(profiles)
		.where(eq(profiles.id, userId))
		.limit(1);
	return row?.image ?? null;
}

async function commitAvatar(
	userId: string,
	bucket: string,
	path: string
): Promise<string> {
	const previous = await currentImage(userId);
	const url = publicUrl(bucket, path);

	await getDb().update(profiles).set({ image: url }).where(eq(profiles.id, userId));
	await removePreviousAvatar(userId, previous);

	return url;
}

// Generated here and never accepted from the browser, because the bucket is public.
export async function setGeneratedAvatar(
	userId: string,
	seed: string
): Promise<string> {
	const path = `${userId}/${AVATAR_STYLE}-${crypto.randomUUID()}.svg`;

	const { error } = await getSupabaseAdmin()
		.storage.from(GENERATED_BUCKET)
		.upload(path, renderAvatarSvg(seed), {
			contentType: "image/svg+xml",
			upsert: false,
		});

	if (error) throw new Unavailable("Non è stato possibile salvare l'avatar. Riprova.");

	return commitAvatar(userId, GENERATED_BUCKET, path);
}

/** The path is chosen by the server, never by the client. */
export async function createAvatarUploadUrl(userId: string, contentType: string) {
	const path = `${userId}/${crypto.randomUUID()}.${EXTENSION[contentType] ?? "bin"}`;

	const { data, error } = await getSupabaseAdmin()
		.storage.from(UPLOAD_BUCKET)
		.createSignedUploadUrl(path);

	if (error || !data) {
		throw new Unavailable("Non è stato possibile preparare il caricamento. Riprova.");
	}

	return { bucket: UPLOAD_BUCKET, path, token: data.token };
}

export async function confirmUploadedAvatar(
	userId: string,
	path: string
): Promise<string> {
	if (!path.startsWith(`${userId}/`)) {
		throw new Unavailable("Percorso non valido.");
	}

	const name = path.slice(userId.length + 1);
	const { data, error } = await getSupabaseAdmin()
		.storage.from(UPLOAD_BUCKET)
		.list(userId, { search: name });

	const uploaded = data?.find(file => file.name === name);
	if (error || !uploaded) throw new Unavailable("Caricamento non trovato. Riprova.");

	if (!RASTER_TYPES.has(String(uploaded.metadata?.mimetype ?? ""))) {
		await getSupabaseAdmin().storage.from(UPLOAD_BUCKET).remove([path]);
		throw new Unavailable("Formato non supportato.");
	}

	return commitAvatar(userId, UPLOAD_BUCKET, path);
}

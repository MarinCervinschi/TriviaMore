import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { log } from "@/lib/logging/server";
import { Invalid, Unavailable } from "@/lib/server/errors";
import {
	deleteObjects,
	publicBaseUrl,
	publicUrl,
	putObject,
} from "@/lib/storage/server";

import { AVATAR_STYLE, avatarSeeds, renderAvatarSvg } from "./dicebear";
import type { AvatarChoice } from "./types";

// Prefixes in the public bucket, named after the Supabase buckets they replace, so a migrated URL keeps its path.
const GENERATED_PREFIX = "avatars";
const UPLOAD_PREFIX = "avatar-uploads";
const PREVIEW_COUNT = 12;

export function getAvatarChoices(userId: string, page = 0): AvatarChoice[] {
	return avatarSeeds(`${userId}:${page}`, PREVIEW_COUNT).map(seed => ({
		seed,
		dataUri: `data:image/svg+xml;base64,${Buffer.from(renderAvatarSvg(seed)).toString("base64")}`,
	}));
}

/** An OAuth picture lives on Google, so it is forgotten instead of deleted. */
export async function removeStoredAvatar(userId: string, current: string | null) {
	if (!current?.startsWith(`${publicBaseUrl()}/`)) return;
	const key = decodeURIComponent(current.slice(publicBaseUrl().length + 1));
	for (const prefix of [GENERATED_PREFIX, UPLOAD_PREFIX]) {
		if (!key.startsWith(`${prefix}/${userId}/`)) continue;
		await deleteObjects("public", [key]);
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

async function commitAvatar(userId: string, key: string): Promise<string> {
	const previous = await currentImage(userId);
	const url = publicUrl(key);

	await getDb().update(profiles).set({ image: url }).where(eq(profiles.id, userId));
	await removeStoredAvatar(userId, previous);

	return url;
}

// Generated here and never accepted from the browser, because the bucket is public.
export async function setGeneratedAvatar(
	userId: string,
	seed: string
): Promise<string> {
	const key = `${GENERATED_PREFIX}/${userId}/${AVATAR_STYLE}-${crypto.randomUUID()}.svg`;

	try {
		await putObject("public", key, renderAvatarSvg(seed), "image/svg+xml");
	} catch (error) {
		log.error("Generated avatar of {UserId} not stored", { UserId: userId }, error);
		throw new Unavailable("Non è stato possibile salvare l'avatar. Riprova.");
	}

	return commitAvatar(userId, key);
}

// Read from the bytes, not from the browser's word, so the public bucket only ever serves raster images.
function rasterType(bytes: Uint8Array): { type: string; extension: string } | null {
	const ascii = (from: number, to: number) =>
		String.fromCharCode(...bytes.subarray(from, to));
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return { type: "image/jpeg", extension: "jpg" };
	}
	if (ascii(1, 4) === "PNG") return { type: "image/png", extension: "png" };
	if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
		return { type: "image/webp", extension: "webp" };
	}
	return null;
}

/** The key is chosen by the server, never by the client. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const raster = rasterType(bytes);
	if (!raster) throw new Invalid("Formato non supportato.");

	const key = `${UPLOAD_PREFIX}/${userId}/${crypto.randomUUID()}.${raster.extension}`;
	try {
		await putObject("public", key, bytes, raster.type);
	} catch (error) {
		log.error("Avatar upload of {UserId} not stored", { UserId: userId }, error);
		throw new Unavailable("Caricamento non riuscito. Riprova.");
	}

	return commitAvatar(userId, key);
}

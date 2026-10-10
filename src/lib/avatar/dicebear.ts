import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";

/** Lorelei, by Lisa Wischofsky, under CC0 1.0. */
export const AVATAR_STYLE = "lorelei";

const SIZE = 256;

// Baked in, because a transparent cut-out reads as a floating head on a dark page.
const BACKGROUND = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];

export function renderAvatarSvg(seed: string): string {
	return createAvatar(lorelei, {
		seed,
		size: SIZE,
		backgroundColor: BACKGROUND,
		backgroundType: ["solid"],
	}).toString();
}

export function avatarSeeds(userId: string, count: number): string[] {
	return Array.from({ length: count }, (_, index) => `${userId}:${index}`);
}

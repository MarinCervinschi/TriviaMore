import { avatarSeeds, renderAvatarSvg } from "@/lib/avatar/dicebear";
import type { AvatarChoice } from "@/lib/avatar/types";

/**
 * Generated from the real style rather than pasted in: `dicebear.ts` touches no
 * database, so a story can call it directly and the previews are exactly what
 * the server would produce. A fixed seed keeps the grid stable across renders.
 */
export function avatarChoices(page = 0): AvatarChoice[] {
	return avatarSeeds(`00000000-0000-4000-8000-000000000001:${page}`, 12).map(seed => ({
		seed,
		dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(renderAvatarSvg(seed))}`,
	}));
}

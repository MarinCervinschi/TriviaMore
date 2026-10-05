import { avatarSeeds, renderAvatarSvg } from "@/lib/avatar/dicebear";
import type { AvatarChoice } from "@/lib/avatar/types";

export function avatarChoices(page = 0): AvatarChoice[] {
	return avatarSeeds(`00000000-0000-4000-8000-000000000001:${page}`, 12).map(seed => ({
		seed,
		dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(renderAvatarSvg(seed))}`,
	}));
}

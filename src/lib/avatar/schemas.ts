import { z } from "zod";

import { formFileSchema } from "@/lib/storage/schemas";

export const avatarSeedSchema = z.object({
	seed: z.string().min(1).max(200),
});

/** The browser downscales to 512 px first, so a real upload is far below this. */
export const avatarFileSchema = formFileSchema(
	2 * 1024 * 1024,
	"L'immagine supera i 2 MB."
);

export type AvatarSeedInput = z.infer<typeof avatarSeedSchema>;

import { z } from "zod";

export const avatarSeedSchema = z.object({
	seed: z.string().min(1).max(200),
});

export const avatarUploadUrlSchema = z.object({
	contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export const avatarPathSchema = z.object({
	path: z.string().min(1).max(300),
});

export type AvatarSeedInput = z.infer<typeof avatarSeedSchema>;
export type AvatarUploadUrlInput = z.infer<typeof avatarUploadUrlSchema>;
export type AvatarPathInput = z.infer<typeof avatarPathSchema>;

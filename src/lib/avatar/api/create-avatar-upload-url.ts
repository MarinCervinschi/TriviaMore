import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { avatarUploadUrlSchema } from "../schemas";
import { createAvatarUploadUrl } from "../service";

export const createAvatarUploadUrlFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(avatarUploadUrlSchema)
	.handler(({ data, context }) =>
		createAvatarUploadUrl(context.user.id, data.contentType)
	);

import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { avatarFileSchema } from "../schemas";
import { uploadAvatar } from "../service";

export const uploadAvatarFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(avatarFileSchema)
	.handler(({ data, context }) => uploadAvatar(context.user.id, data.file));

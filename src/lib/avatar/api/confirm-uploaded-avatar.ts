import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { avatarPathSchema } from "../schemas";
import { confirmUploadedAvatar } from "../service";

export const confirmUploadedAvatarFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(avatarPathSchema)
	.handler(({ data, context }) => confirmUploadedAvatar(context.user.id, data.path));

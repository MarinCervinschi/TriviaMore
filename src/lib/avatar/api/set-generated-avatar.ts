import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { avatarSeedSchema } from "../schemas";
import { setGeneratedAvatar } from "../service";

export const setGeneratedAvatarFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(avatarSeedSchema)
	.handler(({ data, context }) => setGeneratedAvatar(context.user.id, data.seed));

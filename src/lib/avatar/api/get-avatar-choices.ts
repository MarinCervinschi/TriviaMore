import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getAvatarChoices } from "../service";

export const getAvatarChoicesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ page: z.number().int().min(0).max(50).default(0) }))
	.handler(({ data, context }) => getAvatarChoices(context.user.id, data.page));

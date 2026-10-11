import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { idSchema } from "../schemas";
import { removeSitting } from "../service/calendar";

export const removeSittingFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(idSchema)
	.handler(({ data, context }) => removeSitting(context.user.id, data.id));

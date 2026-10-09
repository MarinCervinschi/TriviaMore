import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { updateSittingSchema } from "../schemas";
import { updateSitting } from "../service/calendar";

export const updateSittingFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateSittingSchema)
	.handler(({ data, context }) => updateSitting(context.user.id, data));

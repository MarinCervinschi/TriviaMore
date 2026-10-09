import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { createSittingSchema } from "../schemas";
import { createSitting } from "../service/calendar";

export const createSittingFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createSittingSchema)
	.handler(({ data, context }) => createSitting(context.user.id, data));

import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { createEventSchema } from "../schemas";
import { createEvent } from "../service/calendar";

export const createEventFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createEventSchema)
	.handler(({ data, context }) => createEvent(context.user.id, data));

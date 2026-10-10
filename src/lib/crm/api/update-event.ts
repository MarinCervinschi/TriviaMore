import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { updateEventSchema } from "../schemas";
import { updateEvent } from "../service/calendar";

export const updateEventFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateEventSchema)
	.handler(({ data, context }) => updateEvent(context.user.id, data));

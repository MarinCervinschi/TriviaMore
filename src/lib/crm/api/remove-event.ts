import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { idSchema } from "../schemas";
import { removeEvent } from "../service/calendar";

export const removeEventFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(idSchema)
	.handler(({ data, context }) => removeEvent(context.user.id, data.id));

import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { idSchema } from "../schemas";
import { removeTask } from "../service/calendar";

export const removeTaskFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(idSchema)
	.handler(({ data, context }) => removeTask(context.user.id, data.id));

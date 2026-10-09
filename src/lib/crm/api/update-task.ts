import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { updateTaskSchema } from "../schemas";
import { updateTask } from "../service/calendar";

export const updateTaskFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateTaskSchema)
	.handler(({ data, context }) => updateTask(context.user.id, data));

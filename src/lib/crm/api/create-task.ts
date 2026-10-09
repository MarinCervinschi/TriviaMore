import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { createTaskSchema } from "../schemas";
import { createTask } from "../service/calendar";

export const createTaskFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createTaskSchema)
	.handler(({ data, context }) => createTask(context.user.id, data));

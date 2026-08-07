import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { startQuizSchema } from "../schemas";
import { startQuiz } from "../service";

export const startQuizFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(startQuizSchema)
	.handler(({ data, context }) => startQuiz(context.user.id, data));

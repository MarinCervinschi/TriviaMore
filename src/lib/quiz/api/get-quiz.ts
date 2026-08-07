import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { quizIdSchema } from "../schemas";
import { getQuiz } from "../service";

export const getQuizFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(quizIdSchema)
	.handler(({ data, context }) => getQuiz(context.user?.id ?? null, data.quizId));

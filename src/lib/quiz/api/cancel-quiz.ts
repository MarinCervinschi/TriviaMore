import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { attemptIdSchema } from "../schemas"
import { cancelQuiz } from "../service"

export const cancelQuizFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(attemptIdSchema)
  .handler(({ data, context }) => cancelQuiz(context.user.id, data.quizAttemptId))

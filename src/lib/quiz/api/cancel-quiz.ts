import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { attemptIdSchema } from "../schemas"
import { cancelQuiz } from "../service"

export const cancelQuizFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(attemptIdSchema)
  .handler(({ data, context }) => cancelQuiz(context.user.id, data.quizAttemptId))

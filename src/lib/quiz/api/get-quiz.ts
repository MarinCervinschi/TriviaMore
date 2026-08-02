import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { quizIdSchema } from "../schemas"
import { getQuiz } from "../service"

export const getQuizFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .inputValidator(quizIdSchema)
  .handler(({ data, context }) =>
    getQuiz(context.user?.id ?? null, data.quizId),
  )

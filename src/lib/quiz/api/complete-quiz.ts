import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { completeQuizSchema } from "../schemas"
import { completeQuiz } from "../service"

export const completeQuizFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(completeQuizSchema)
  .handler(({ data, context }) => completeQuiz(context.user.id, data))

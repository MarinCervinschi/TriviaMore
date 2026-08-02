import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { completeQuizSchema } from "../schemas"
import { completeQuiz } from "../service"

export const completeQuizFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(completeQuizSchema)
  .handler(({ data, context }) => completeQuiz(context.user.id, data))

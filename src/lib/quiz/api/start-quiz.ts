import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { startQuizSchema } from "../schemas"
import { startQuiz } from "../service"

export const startQuizFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(startQuizSchema)
  .handler(({ data, context }) => startQuiz(context.user.id, data))

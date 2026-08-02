import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { startFlashcardSchema } from "../schemas"
import { startExamFlashcard } from "../service"

export const startExamFlashcardFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(startFlashcardSchema)
  .handler(({ data, context }) => startExamFlashcard(context.user.id, data))

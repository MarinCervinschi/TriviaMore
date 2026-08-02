import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { startFlashcardSchema } from "../schemas"
import { startFlashcard } from "../service"

export const startFlashcardFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(startFlashcardSchema)
  .handler(({ data, context }) => startFlashcard(context.user.id, data))

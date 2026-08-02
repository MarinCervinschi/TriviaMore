import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { startFlashcardSchema } from "../schemas"
import { startFlashcard } from "../service"

export const startFlashcardFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(startFlashcardSchema)
  .handler(({ data, context }) => startFlashcard(context.user.id, data))

import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { sessionIdSchema } from "../schemas"
import { getFlashcardSession } from "../service"

export const getFlashcardSessionFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .inputValidator(sessionIdSchema)
  .handler(({ data, context }) =>
    getFlashcardSession(context.user?.id ?? null, data.sessionId),
  )

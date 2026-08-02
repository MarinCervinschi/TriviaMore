import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { resultsSchema } from "../schemas"
import { getQuizResults } from "../service"

export const getQuizResultsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .inputValidator(resultsSchema)
  .handler(({ data, context }) =>
    getQuizResults(context.user?.id ?? null, data.attemptId),
  )

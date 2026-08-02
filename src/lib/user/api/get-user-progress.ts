import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getUserProgress } from "../service/progress"
import type { UserProgress } from "../types"

export const getUserProgressFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .handler(({ context }): Promise<UserProgress[]> =>
    context.user ? getUserProgress(context.user.id) : Promise.resolve([]),
  )

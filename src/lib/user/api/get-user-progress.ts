import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"

import { getUserProgress } from "../service/progress"
import type { UserProgress } from "../types"

export const getUserProgressFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }): Promise<UserProgress[]> =>
    context.user ? getUserProgress(context.user.id) : Promise.resolve([]),
  )

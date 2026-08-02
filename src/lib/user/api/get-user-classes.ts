import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getUserClasses } from "../service/classes"
import type { UserClass } from "../types"

export const getUserClassesFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .handler(({ context }): Promise<UserClass[]> =>
    context.user ? getUserClasses(context.user.id) : Promise.resolve([]),
  )

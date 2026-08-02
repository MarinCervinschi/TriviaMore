import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getUserRequests } from "../service/user-requests"

export const getUserRequestsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, authMiddleware])
  .handler(({ context }) => getUserRequests(context.user.id))

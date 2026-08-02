import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { getUserRequests } from "../service/user-requests"

export const getUserRequestsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => getUserRequests(context.user.id))

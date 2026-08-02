import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getUnreadCount } from "../service"

export const getUnreadCountFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, authMiddleware])
  .handler(({ context }) => getUnreadCount(context.user.id))

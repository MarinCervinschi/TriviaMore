import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getNotifications } from "../service"

export const getNotificationsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, authMiddleware])
  .handler(({ context }) => getNotifications(context.user.id))

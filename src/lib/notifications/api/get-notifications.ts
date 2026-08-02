import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { getNotifications } from "../service"

export const getNotificationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => getNotifications(context.user.id))

import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { markAllNotificationsRead } from "../service"

export const markAllReadFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(({ context }) => markAllNotificationsRead(context.user.id))

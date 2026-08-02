import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { markAllNotificationsRead } from "../service"

export const markAllReadFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .handler(({ context }) => markAllNotificationsRead(context.user.id))

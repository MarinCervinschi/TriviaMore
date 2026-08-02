import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { notificationIdSchema } from "../schemas"
import { markNotificationRead } from "../service"

export const markReadFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(notificationIdSchema)
  .handler(({ data, context }) =>
    markNotificationRead(context.user.id, data.id),
  )

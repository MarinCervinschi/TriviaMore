import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { notificationIdSchema } from "../schemas"
import { removeNotification } from "../service"

export const deleteNotificationFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(notificationIdSchema)
  .handler(({ data, context }) => removeNotification(context.user.id, data.id))

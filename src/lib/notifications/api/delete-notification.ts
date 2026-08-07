import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { notificationIdSchema } from "../schemas";
import { removeNotification } from "../service";

export const deleteNotificationFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(notificationIdSchema)
	.handler(({ data, context }) => removeNotification(context.user.id, data.id));

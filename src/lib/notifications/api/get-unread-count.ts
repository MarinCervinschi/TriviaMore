import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getUnreadCount } from "../service";

export const getUnreadCountFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => getUnreadCount(context.user.id));

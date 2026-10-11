import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getCalendar } from "../service/calendar";

export const getCalendarFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => getCalendar(context.user.id));

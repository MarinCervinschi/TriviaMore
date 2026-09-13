import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getOpenAttempt } from "../service";

export const getOpenAttemptFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => getOpenAttempt(context.user.id));

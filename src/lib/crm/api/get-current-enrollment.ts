import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getCurrentEnrollment } from "../service";

export const getCurrentEnrollmentFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => getCurrentEnrollment(context.user.id));

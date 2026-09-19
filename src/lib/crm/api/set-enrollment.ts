import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { setEnrollmentSchema } from "../schemas";
import { setEnrollment } from "../service";

export const setEnrollmentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(setEnrollmentSchema)
	.handler(({ data, context }) => setEnrollment(context.user.id, data));

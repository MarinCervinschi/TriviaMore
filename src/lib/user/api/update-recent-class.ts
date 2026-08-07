import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { classRefSchema } from "../schemas";
import { updateRecentClass } from "../service/classes";

// Fire-and-forget from the class page: an anonymous visitor is a no-op, not an
// error.
export const updateRecentClassFn = createServerFn({ method: "POST" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(classRefSchema)
	.handler(({ data, context }) =>
		context.user ? updateRecentClass(context.user.id, data) : Promise.resolve()
	);

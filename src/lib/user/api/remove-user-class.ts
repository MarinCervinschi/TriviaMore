import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { classIdSchema } from "../schemas";
import { removeUserClass } from "../service/classes";

export const removeUserClassFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(classIdSchema)
	.handler(({ data, context }) => removeUserClass(context.user.id, data.classId));

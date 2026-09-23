import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { searchClassesSchema } from "../schemas";
import { searchClasses } from "../service/classes";

export const searchClassesFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(searchClassesSchema)
	.handler(({ data, context }) => searchClasses(context.user?.id ?? null, data));

import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { classCodesSchema } from "../schemas";
import { getClassWithSections } from "../service/classes";

export const getClassWithSectionsFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(classCodesSchema)
	.handler(({ data, context }) => getClassWithSections(context.user?.id ?? null, data));

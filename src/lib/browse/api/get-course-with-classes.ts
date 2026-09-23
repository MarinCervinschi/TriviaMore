import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { courseCodesSchema } from "../schemas";
import { getCourseWithClasses } from "../service/courses";

export const getCourseWithClassesFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(courseCodesSchema)
	.handler(({ data, context }) =>
		getCourseWithClasses(context.user?.id ?? null, data.deptCode, data.courseCode)
	);

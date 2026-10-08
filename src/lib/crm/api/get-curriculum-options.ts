import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { curriculumOptionsSchema } from "../schemas";
import { getCurriculumOptions } from "../service/enrollment";

export const getCurriculumOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(curriculumOptionsSchema)
	.handler(({ data }) => getCurriculumOptions(data.courseId, data.startYear));

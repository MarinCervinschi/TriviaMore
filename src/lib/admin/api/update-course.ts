import { createServerFn } from "@tanstack/react-start";

import { idSchema, updateCourseSchema } from "../schemas";
import { updateCourse } from "../service/courses";

export const updateCourseFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema.merge(updateCourseSchema))
	.handler(({ data: { id, ...updates } }) => updateCourse(id, updates));

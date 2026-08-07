import { createServerFn } from "@tanstack/react-start";

import { courseSchema } from "../schemas";
import { createCourse } from "../service/courses";

export const createCourseFn = createServerFn({ method: "POST" })
	.inputValidator(courseSchema)
	.handler(({ data }) => createCourse(data));

import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { deleteCourse } from "../service/courses";

export const deleteCourseFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema)
	.handler(({ data }) => deleteCourse(data.id));

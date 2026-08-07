import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { getAdminCourseDetail } from "../service/courses";

export const getAdminCourseDetailFn = createServerFn({ method: "GET" })
	.inputValidator(idSchema)
	.handler(({ data }) => getAdminCourseDetail(data.id));

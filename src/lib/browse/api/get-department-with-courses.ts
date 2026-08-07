import { createServerFn } from "@tanstack/react-start";

import { departmentCodeSchema } from "../schemas";
import { getDepartmentWithCourses } from "../service/departments";

export const getDepartmentWithCoursesFn = createServerFn({ method: "GET" })
	.inputValidator(departmentCodeSchema)
	.handler(({ data }) => getDepartmentWithCourses(data.code));

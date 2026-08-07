import { createServerFn } from "@tanstack/react-start";

import { departmentSchema } from "../schemas";
import { createDepartment } from "../service/departments";

export const createDepartmentFn = createServerFn({ method: "POST" })
	.inputValidator(departmentSchema)
	.handler(({ data }) => createDepartment(data));

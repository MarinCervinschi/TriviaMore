import { createServerFn } from "@tanstack/react-start";

import { departmentAdminSchema } from "../schemas";
import { addDepartmentAdmin } from "../service/users";

export const addDepartmentAdminFn = createServerFn({ method: "POST" })
	.inputValidator(departmentAdminSchema)
	.handler(({ data }) => addDepartmentAdmin(data));

import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { deleteDepartment } from "../service/departments";

export const deleteDepartmentFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema)
	.handler(({ data }) => deleteDepartment(data.id));

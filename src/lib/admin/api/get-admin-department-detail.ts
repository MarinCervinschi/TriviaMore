import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { getAdminDepartmentDetail } from "../service/departments";

export const getAdminDepartmentDetailFn = createServerFn({ method: "GET" })
	.inputValidator(idSchema)
	.handler(({ data }) => getAdminDepartmentDetail(data.id));

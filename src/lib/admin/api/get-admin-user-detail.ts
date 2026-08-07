import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { getAdminUserDetail } from "../service/users";

export const getAdminUserDetailFn = createServerFn({ method: "GET" })
	.inputValidator(idSchema)
	.handler(({ data }) => getAdminUserDetail(data.id));

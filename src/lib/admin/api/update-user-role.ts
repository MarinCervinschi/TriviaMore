import { createServerFn } from "@tanstack/react-start";

import { userRoleSchema } from "../schemas";
import { updateUserRole } from "../service/users";

export const updateUserRoleFn = createServerFn({ method: "POST" })
	.inputValidator(userRoleSchema)
	.handler(({ data }) => updateUserRole(data));

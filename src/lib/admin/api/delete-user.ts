import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { deleteUser } from "../service/users";

export const deleteUserFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema)
	.handler(({ data }) => deleteUser(data.id));

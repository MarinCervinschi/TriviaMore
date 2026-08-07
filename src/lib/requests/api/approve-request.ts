import { createServerFn } from "@tanstack/react-start";

import { requestIdSchema } from "../schemas";
import { approveRequest } from "../service/admin-requests";

export const approveRequestFn = createServerFn({ method: "POST" })
	.inputValidator(requestIdSchema)
	.handler(({ data }) => approveRequest(data.id));

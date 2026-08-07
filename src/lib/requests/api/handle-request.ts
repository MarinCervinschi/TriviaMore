import { createServerFn } from "@tanstack/react-start";

import { handleRequestSchema } from "../schemas";
import { handleRequest } from "../service/admin-requests";

export const handleRequestFn = createServerFn({ method: "POST" })
	.inputValidator(handleRequestSchema)
	.handler(({ data }) => handleRequest(data));

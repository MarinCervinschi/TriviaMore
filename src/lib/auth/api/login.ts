import { createServerFn } from "@tanstack/react-start";

import { loginSchema } from "../schemas";
import { login } from "../service";

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator(loginSchema)
	.handler(({ data }) => login(data));

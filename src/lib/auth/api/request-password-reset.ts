import { createServerFn } from "@tanstack/react-start";

import { forgotPasswordSchema } from "../schemas";
import { requestPasswordReset } from "../service";

export const requestPasswordResetFn = createServerFn({ method: "POST" })
	.inputValidator(forgotPasswordSchema)
	.handler(({ data }) => requestPasswordReset(data.email));

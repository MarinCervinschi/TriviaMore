import { createServerFn } from "@tanstack/react-start";

import { resetPasswordSchema } from "../schemas";
import { resetPassword } from "../service";

export const resetPasswordFn = createServerFn({ method: "POST" })
	.inputValidator(resetPasswordSchema)
	.handler(({ data }) => resetPassword(data));

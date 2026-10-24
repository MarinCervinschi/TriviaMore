import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { resendConfirmation } from "../service";

export const resendConfirmationFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ email: z.email() }))
	.handler(({ data }) => resendConfirmation(data.email));

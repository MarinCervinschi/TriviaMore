import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { completeOAuth } from "../service";

export const completeOAuthFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ code: z.string().min(1) }))
	.handler(({ data }) => completeOAuth(data.code));

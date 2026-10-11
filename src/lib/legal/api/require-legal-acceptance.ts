import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireLegalAcceptance } from "../guards";

export const requireLegalAcceptanceFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ admin: z.boolean().optional() }).optional())
	.handler(({ data }) => requireLegalAcceptance(data?.admin));

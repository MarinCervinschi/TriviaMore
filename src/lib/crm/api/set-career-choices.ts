import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { setCareerChoicesSchema } from "../schemas";
import { setCareerChoices } from "../service/career";

export const setCareerChoicesFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(setCareerChoicesSchema)
	.handler(({ data, context }) => setCareerChoices(context.user.id, data));

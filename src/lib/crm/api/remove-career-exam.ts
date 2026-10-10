import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { idSchema } from "../schemas";
import { removeCareerExam } from "../service/career";

export const removeCareerExamFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(idSchema)
	.handler(({ data, context }) => removeCareerExam(context.user.id, data.id));

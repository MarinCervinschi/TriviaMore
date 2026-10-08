import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { careerExamIdSchema } from "../schemas";
import { removeCareerExam } from "../service/career";

export const removeCareerExamFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(careerExamIdSchema)
	.handler(({ data, context }) => removeCareerExam(context.user.id, data.id));

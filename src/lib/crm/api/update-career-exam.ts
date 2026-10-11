import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { updateCareerExamSchema } from "../schemas";
import { updateCareerExam } from "../service/career";

export const updateCareerExamFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateCareerExamSchema)
	.handler(({ data, context }) => updateCareerExam(context.user.id, data));

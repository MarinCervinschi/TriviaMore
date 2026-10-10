import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { addCareerExamSchema } from "../schemas";
import { addCareerExam } from "../service/career";

export const addCareerExamFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(addCareerExamSchema)
	.handler(({ data, context }) => addCareerExam(context.user.id, data));

import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { startFlashcardSchema } from "../schemas";
import { startExamFlashcard } from "../service";

export const startExamFlashcardFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(startFlashcardSchema)
	.handler(({ data, context }) => startExamFlashcard(context.user.id, data));

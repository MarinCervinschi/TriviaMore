import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { completeFlashcardSchema } from "../schemas";
import { completeFlashcard } from "../service";

export const completeFlashcardFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(completeFlashcardSchema)
	.handler(({ data, context }) => completeFlashcard(context.user.id, data));

import { z } from "zod";

import { MAX_SESSION_ITEMS } from "@/lib/shared/session";

export const startFlashcardSchema = z.object({
	sectionId: z.string().uuid(),
	cardCount: z.number().min(1).max(MAX_SESSION_ITEMS).default(20),
});

export const sessionIdSchema = z.object({ sessionId: z.string() });

export const completeFlashcardSchema = z.object({
	sessionId: z.string(),
	cardsReviewed: z.number().int().min(0),
});

export type StartFlashcardInput = z.infer<typeof startFlashcardSchema>;
export type CompleteFlashcardInput = z.infer<typeof completeFlashcardSchema>;

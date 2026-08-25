import type { DbOrTx } from "@/db";
import { flashcardAttempts } from "@/db/schema";

export async function insertFlashcardAttempt(
	db: DbOrTx,
	params: {
		userId: string;
		sessionId: string;
		sectionId: string;
		cardsReviewed: number;
	}
) {
	await db
		.insert(flashcardAttempts)
		.values({
			userId: params.userId,
			sessionId: params.sessionId,
			sectionId: params.sectionId,
			cardsReviewed: params.cardsReviewed,
		})
		.onConflictDoNothing({
			target: [flashcardAttempts.userId, flashcardAttempts.sessionId],
		});
}

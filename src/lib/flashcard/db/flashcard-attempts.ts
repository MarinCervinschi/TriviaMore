import type { DbOrTx } from "@/db";
import { flashcardAttempts } from "@/db/schema";

/** False when the session had already been recorded. */
export async function insertFlashcardAttempt(
	db: DbOrTx,
	params: {
		userId: string;
		sessionId: string;
		sectionId: string;
		cardsReviewed: number;
	}
): Promise<boolean> {
	const inserted = await db
		.insert(flashcardAttempts)
		.values({
			userId: params.userId,
			sessionId: params.sessionId,
			sectionId: params.sectionId,
			cardsReviewed: params.cardsReviewed,
		})
		.onConflictDoNothing({
			target: [flashcardAttempts.userId, flashcardAttempts.sessionId],
		})
		.returning({ id: flashcardAttempts.id });

	return inserted.length > 0;
}

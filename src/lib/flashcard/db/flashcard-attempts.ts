import type { DbOrTx } from "@/db";
import { flashcardAttempts } from "@/db/schema";

export async function insertFlashcardAttempt(
	db: DbOrTx,
	params: {
		userId: string;
		sectionId: string;
		cardsReviewed: number;
	}
) {
	await db.insert(flashcardAttempts).values({
		userId: params.userId,
		sectionId: params.sectionId,
		cardsReviewed: params.cardsReviewed,
	});
}

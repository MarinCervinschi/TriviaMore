import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { quizAttempts } from "@/db/schema";
import { findCompletedAttemptHistory } from "@/lib/quiz/db/attempts";
import { NotFound } from "@/lib/server/errors";

import type { MasteryScope } from "../schemas";
import type { AttemptHistoryEntry } from "../types";

export async function getAttemptHistory(
	userId: string,
	scope?: MasteryScope
): Promise<AttemptHistoryEntry[]> {
	const rows = await findCompletedAttemptHistory(getDb(), userId, scope);
	return rows.map(row => ({ ...row, completedAt: row.completedAt! }));
}

/**
 * Stars an attempt, or clears it. The user id is part of the predicate rather
 * than a check before it: one statement, and someone else's attempt simply does
 * not match — there is nothing to leak by trying.
 */
export async function setAttemptFavorite(
	userId: string,
	attemptId: string,
	isFavorite: boolean
): Promise<{ isFavorite: boolean }> {
	const [updated] = await getDb()
		.update(quizAttempts)
		.set({ isFavorite })
		.where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)))
		.returning({ isFavorite: quizAttempts.isFavorite });

	if (!updated) throw new NotFound("Tentativo non trovato.");
	return updated;
}

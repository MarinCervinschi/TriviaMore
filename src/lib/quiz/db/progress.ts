import { sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { progress } from "@/db/schema";

import type { QuizMode } from "../types";

// The read side of `progress` belongs to the user domain; the quiz owns this
// write because finishing an attempt is what moves the numbers.
//
// A single upsert, because a select-then-update loses a run whenever two
// attempts finish at once: both read the same counters and the second write
// wins.
export async function recordAttemptInProgress(
	db: DbOrTx,
	params: {
		userId: string;
		sectionId: string;
		quizMode: QuizMode;
		score: number;
		timeSpent: number;
	}
) {
	await db
		.insert(progress)
		.values({
			userId: params.userId,
			sectionId: params.sectionId,
			quizMode: params.quizMode,
			quizzesTaken: 1,
			averageScore: params.score,
			bestScore: params.score,
			totalTimeSpent: params.timeSpent,
		})
		.onConflictDoUpdate({
			target: [progress.userId, progress.sectionId, progress.quizMode],
			set: {
				quizzesTaken: sql`${progress.quizzesTaken} + 1`,
				averageScore: sql`round(
          ((coalesce(${progress.averageScore}, 0) * ${progress.quizzesTaken} + excluded.average_score)
            / (${progress.quizzesTaken} + 1))::numeric,
          2
        )`,
				bestScore: sql`greatest(coalesce(${progress.bestScore}, 0), excluded.best_score)`,
				totalTimeSpent: sql`${progress.totalTimeSpent} + excluded.total_time_spent`,
				lastAccessedAt: sql`now()`,
			},
		});
}

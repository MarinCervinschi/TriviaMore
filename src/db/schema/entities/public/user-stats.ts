import {
	bigint,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

/**
 * The additive half of a user's metrics: every column is `+= n` from one event,
 * so the order events arrive in never changes the result and a reconciliation is
 * a plain comparison. Anything that needs a set or a window lives in the
 * companion rollups, never here.
 */
export const userStats = pgTable(
	"user_stats",
	{
		userId: uuid("user_id").primaryKey().notNull(),
		quizzesCompleted: integer("quizzes_completed").default(0).notNull(),
		perfectQuizzes: integer("perfect_quizzes").default(0).notNull(),
		examSimsPassed: integer("exam_sims_passed").default(0).notNull(),
		flashcardSessions: integer("flashcard_sessions").default(0).notNull(),
		approvedRequests: integer("approved_requests").default(0).notNull(),
		totalTimeMs: bigint("total_time_ms", { mode: "number" }).default(0).notNull(),
		// Distinct questions, not answers: the counter only moves when
		// `user_question_stats` gains the row that makes it true.
		hardCorrect: integer("hard_correct").default(0).notNull(),
		bookmarkedThenCorrect: integer("bookmarked_then_correct").default(0).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	table => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_stats_user_id_fkey",
		}).onDelete("cascade"),
	]
).enableRLS();

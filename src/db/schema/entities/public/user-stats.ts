import {
	bigint,
	foreignKey,
	integer,
	pgTable,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

/** Every column is `+= n` from one event, so arrival order never changes the result. */
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
		// Distinct questions, moved only when `user_question_stats` gains the row.
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

import { boolean, foreignKey, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { questions } from "../catalog/questions";
import { profiles } from "./profiles";

/**
 * The set behind the two "distinct question" counters in `user_stats`. A row
 * exists only once a question has earned one of the flags, so this stays far
 * smaller than the answer history it replaces — and it is what lets an insert
 * that does nothing tell the counter not to move.
 */
export const userQuestionStats = pgTable(
	"user_question_stats",
	{
		userId: uuid("user_id").notNull(),
		questionId: uuid("question_id").notNull(),
		hardCorrect: boolean("hard_correct").default(false).notNull(),
		bookmarkedThenCorrect: boolean("bookmarked_then_correct").default(false).notNull(),
	},
	table => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_question_stats_user_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "user_question_stats_question_id_fkey",
		}).onDelete("cascade"),
		primaryKey({
			columns: [table.userId, table.questionId],
			name: "user_question_stats_pkey",
		}),
	]
).enableRLS();

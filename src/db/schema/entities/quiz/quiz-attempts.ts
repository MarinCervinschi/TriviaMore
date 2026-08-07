import {
	doublePrecision,
	foreignKey,
	index,
	integer,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";
import { profiles } from "../public/profiles";
import { quizzes } from "./quizzes";

export const quizAttempts = quizSchema
	.table(
		"quiz_attempts",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			quizId: uuid("quiz_id").notNull(),
			score: doublePrecision().notNull(),
			timeSpent: integer("time_spent"),
			completedAt: timestamp("completed_at", {
				withTimezone: true,
				mode: "string",
			}),
		},
		table => [
			index("idx_quiz_attempts_completed_at").using(
				"btree",
				table.completedAt.asc().nullsLast().op("timestamptz_ops")
			),
			index("idx_quiz_attempts_quiz_id").using(
				"btree",
				table.quizId.asc().nullsLast().op("uuid_ops")
			),
			index("idx_quiz_attempts_user_id").using(
				"btree",
				table.userId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.quizId],
				foreignColumns: [quizzes.id],
				name: "quiz_attempts_quiz_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "quiz_attempts_user_id_fkey",
			}).onDelete("cascade"),
		]
	)
	.enableRLS();

import { sql } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	foreignKey,
	index,
	integer,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";
import { sections } from "../catalog/sections";
import { profiles } from "../public/profiles";
import { quizModeEnum } from "./enums";
import { quizzes } from "./quizzes";

export const quizAttempts = quizSchema
	.table(
		"quiz_attempts",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			quizId: uuid("quiz_id"),
			sectionId: uuid("section_id"),
			quizMode: quizModeEnum("quiz_mode"),
			score: doublePrecision().notNull(),
			timeSpent: integer("time_spent"),
			startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			// What the abandonment horizon measures. `started_at` cannot: an attempt
			// resumed daily for a week is in use, however long ago it was begun.
			lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			completedAt: timestamp("completed_at", {
				withTimezone: true,
				mode: "string",
			}),
			isFavorite: boolean("is_favorite").notNull().default(false),
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
			index("idx_quiz_attempts_section_id").using(
				"btree",
				table.sectionId.asc().nullsLast().op("uuid_ops")
			),
			index("idx_quiz_attempts_user_id").using(
				"btree",
				table.userId.asc().nullsLast().op("uuid_ops")
			),
			index("idx_quiz_attempts_user_favorite")
				.using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
				.where(sql`is_favorite`),
			// Unique, not merely indexed: one open attempt per user is an invariant the
			// database holds, so two concurrent starts cannot both pass the read gate.
			uniqueIndex("idx_quiz_attempts_user_open")
				.using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
				.where(sql`completed_at IS NULL`),
			foreignKey({
				columns: [table.quizId],
				foreignColumns: [quizzes.id],
				name: "quiz_attempts_quiz_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.sectionId],
				foreignColumns: [sections.id],
				name: "quiz_attempts_section_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "quiz_attempts_user_id_fkey",
			}).onDelete("cascade"),
		]
	)
	.enableRLS();

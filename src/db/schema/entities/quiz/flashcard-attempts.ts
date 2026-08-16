import { foreignKey, index, integer, timestamp, uuid } from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";
import { sections } from "../catalog/sections";
import { profiles } from "../public/profiles";

export const flashcardAttempts = quizSchema
	.table(
		"flashcard_attempts",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			userId: uuid("user_id").notNull(),
			sectionId: uuid("section_id"),
			cardsReviewed: integer("cards_reviewed"),
			completedAt: timestamp("completed_at", {
				withTimezone: true,
				mode: "string",
			})
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_flashcard_attempts_completed_at").using(
				"btree",
				table.completedAt.asc().nullsLast().op("timestamptz_ops")
			),
			index("idx_flashcard_attempts_section_id").using(
				"btree",
				table.sectionId.asc().nullsLast().op("uuid_ops")
			),
			index("idx_flashcard_attempts_user_id").using(
				"btree",
				table.userId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.sectionId],
				foreignColumns: [sections.id],
				name: "flashcard_attempts_section_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.userId],
				foreignColumns: [profiles.id],
				name: "flashcard_attempts_user_id_fkey",
			}).onDelete("cascade"),
		]
	)
	.enableRLS();

import {
	foreignKey,
	index,
	integer,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

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
			// The encoded session the run came from. Its URL is replayable, so this
			// is what keeps a reload from recording the same session twice.
			sessionId: text("session_id"),
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
			unique("flashcard_attempts_user_id_session_id_key").on(
				table.userId,
				table.sessionId
			),
		]
	)
	.enableRLS();

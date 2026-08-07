import { sql } from "drizzle-orm";
import { check, foreignKey, index, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { catalogSchema } from "../../common";
import { difficultyEnum, questionTypeEnum } from "./enums";
import { sections } from "./sections";

export const questions = catalogSchema
	.table(
		"questions",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			content: text().notNull(),
			questionType: questionTypeEnum("question_type").notNull(),
			options: text().array(),
			correctAnswer: text("correct_answer").array().notNull(),
			explanation: text(),
			difficulty: difficultyEnum().default("MEDIUM").notNull(),
			sectionId: uuid("section_id").notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_questions_difficulty").using(
				"btree",
				table.difficulty.asc().nullsLast().op("enum_ops")
			),
			index("idx_questions_question_type").using(
				"btree",
				table.questionType.asc().nullsLast().op("enum_ops")
			),
			index("idx_questions_section_id").using(
				"btree",
				table.sectionId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.sectionId],
				foreignColumns: [sections.id],
				name: "questions_section_id_fkey",
			}).onDelete("cascade"),
			check(
				"questions_options_shape_check",
				sql`((question_type = 'SHORT_ANSWER'::question_type) AND (options IS NULL)) OR ((question_type = 'TRUE_FALSE'::question_type) AND (options = ARRAY['Vero'::text, 'Falso'::text])) OR ((question_type = 'MULTIPLE_CHOICE'::question_type) AND ((array_length(options, 1) >= 2) AND (array_length(options, 1) <= 40)))`
			),
		]
	)
	.enableRLS();

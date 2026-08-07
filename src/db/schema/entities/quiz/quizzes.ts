import { foreignKey, index, integer, timestamp, uuid } from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";
import { sections } from "../catalog/sections";
import { quizModeEnum } from "./enums";
import { evaluationModes } from "./evaluation-modes";

export const quizzes = quizSchema
	.table(
		"quizzes",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			timeLimit: integer("time_limit"),
			sectionId: uuid("section_id").notNull(),
			evaluationModeId: uuid("evaluation_mode_id").notNull(),
			quizMode: quizModeEnum("quiz_mode").default("STUDY").notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			index("idx_quizzes_evaluation_mode_id").using(
				"btree",
				table.evaluationModeId.asc().nullsLast().op("uuid_ops")
			),
			index("idx_quizzes_quiz_mode").using(
				"btree",
				table.quizMode.asc().nullsLast().op("enum_ops")
			),
			index("idx_quizzes_section_id").using(
				"btree",
				table.sectionId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.evaluationModeId],
				foreignColumns: [evaluationModes.id],
				name: "quizzes_evaluation_mode_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.sectionId],
				foreignColumns: [sections.id],
				name: "quizzes_section_id_fkey",
			}).onDelete("cascade"),
		]
	)
	.enableRLS();

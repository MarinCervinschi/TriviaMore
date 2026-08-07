import {
	boolean,
	doublePrecision,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";

export const evaluationModes = quizSchema
	.table(
		"evaluation_modes",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			name: text().notNull(),
			description: text(),
			correctAnswerPoints: doublePrecision("correct_answer_points")
				.default(1)
				.notNull(),
			incorrectAnswerPoints: doublePrecision("incorrect_answer_points")
				.default(0)
				.notNull(),
			partialCreditEnabled: boolean("partial_credit_enabled").default(false).notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
			updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [unique("evaluation_modes_name_key").on(table.name)]
	)
	.enableRLS();

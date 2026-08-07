import { foreignKey, integer, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";
import { questions } from "../catalog/questions";
import { quizzes } from "./quizzes";

export const quizQuestions = quizSchema
	.table(
		"quiz_questions",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			quizId: uuid("quiz_id").notNull(),
			questionId: uuid("question_id").notNull(),
			order: integer().notNull(),
			createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
				.defaultNow()
				.notNull(),
		},
		table => [
			foreignKey({
				columns: [table.questionId],
				foreignColumns: [questions.id],
				name: "quiz_questions_question_id_fkey",
			}).onDelete("cascade"),
			foreignKey({
				columns: [table.quizId],
				foreignColumns: [quizzes.id],
				name: "quiz_questions_quiz_id_fkey",
			}).onDelete("cascade"),
			unique("quiz_questions_quiz_id_question_id_key").on(
				table.quizId,
				table.questionId
			),
		]
	)
	.enableRLS();

import {
	doublePrecision,
	foreignKey,
	index,
	integer,
	text,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { quizSchema } from "../../common";
import { difficultyEnum, questionTypeEnum } from "../catalog/enums";
import { questions } from "../catalog/questions";
import { sections } from "../catalog/sections";
import { quizAttempts } from "./quiz-attempts";

export const answerAttempts = quizSchema
	.table(
		"answer_attempts",
		{
			id: uuid().defaultRandom().primaryKey().notNull(),
			quizAttemptId: uuid("quiz_attempt_id").notNull(),
			questionId: uuid("question_id"),
			sectionId: uuid("section_id"),
			difficulty: difficultyEnum(),
			questionType: questionTypeEnum("question_type"),
			userAnswer: text("user_answer").array().notNull(),
			score: doublePrecision().notNull(),
			timeSpent: integer("time_spent"),
		},
		table => [
			index("idx_answer_attempts_section_id").using(
				"btree",
				table.sectionId.asc().nullsLast().op("uuid_ops")
			),
			foreignKey({
				columns: [table.questionId],
				foreignColumns: [questions.id],
				name: "answer_attempts_question_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.sectionId],
				foreignColumns: [sections.id],
				name: "answer_attempts_section_id_fkey",
			}).onDelete("set null"),
			foreignKey({
				columns: [table.quizAttemptId],
				foreignColumns: [quizAttempts.id],
				name: "answer_attempts_quiz_attempt_id_fkey",
			}).onDelete("cascade"),
			unique("answer_attempts_quiz_attempt_id_question_id_key").on(
				table.quizAttemptId,
				table.questionId
			),
		]
	)
	.enableRLS();

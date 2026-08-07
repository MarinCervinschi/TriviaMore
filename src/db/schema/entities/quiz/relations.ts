import { relations } from "drizzle-orm";

import { questions } from "../catalog/questions";
import { sections } from "../catalog/sections";
import { profiles } from "../public/profiles";
import { answerAttempts } from "./answer-attempts";
import { evaluationModes } from "./evaluation-modes";
import { quizAttempts } from "./quiz-attempts";
import { quizQuestions } from "./quiz-questions";
import { quizzes } from "./quizzes";

export const evaluationModesRelations = relations(evaluationModes, ({ many }) => ({
	quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
	section: one(sections, {
		fields: [quizzes.sectionId],
		references: [sections.id],
	}),
	evaluationMode: one(evaluationModes, {
		fields: [quizzes.evaluationModeId],
		references: [evaluationModes.id],
	}),
	questions: many(quizQuestions),
	attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
	quiz: one(quizzes, {
		fields: [quizQuestions.quizId],
		references: [quizzes.id],
	}),
	question: one(questions, {
		fields: [quizQuestions.questionId],
		references: [questions.id],
	}),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
	user: one(profiles, {
		fields: [quizAttempts.userId],
		references: [profiles.id],
	}),
	quiz: one(quizzes, {
		fields: [quizAttempts.quizId],
		references: [quizzes.id],
	}),
	answers: many(answerAttempts),
}));

export const answerAttemptsRelations = relations(answerAttempts, ({ one }) => ({
	attempt: one(quizAttempts, {
		fields: [answerAttempts.quizAttemptId],
		references: [quizAttempts.id],
	}),
	question: one(questions, {
		fields: [answerAttempts.questionId],
		references: [questions.id],
	}),
}));

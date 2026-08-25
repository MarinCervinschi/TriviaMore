import type { evaluationModes, questions, quizzes } from "@/db/schema";

type QuestionRow = typeof questions.$inferSelect;

export type QuizMode = (typeof quizzes.$inferSelect)["quizMode"];

export type EvaluationMode = Pick<
	typeof evaluationModes.$inferSelect,
	| "id"
	| "name"
	| "description"
	| "correctAnswerPoints"
	| "incorrectAnswerPoints"
	| "partialCreditEnabled"
>;

export type QuizQuestion = Pick<
	QuestionRow,
	| "id"
	| "content"
	| "questionType"
	| "options"
	| "correctAnswer"
	| "explanation"
	| "difficulty"
> & {
	order: number;
};

export type QuizSection = {
	id: string;
	name: string;
	className: string;
	courseName: string | null;
	departmentName: string | null;
	path: string | null;
};

export type Quiz = {
	id: string;
	timeLimit: number | null;
	quizMode: QuizMode;
	evaluationMode: EvaluationMode;
	section: QuizSection;
	questions: QuizQuestion[];
	attemptId?: string;
};

export type UserAnswer = {
	questionId: string;
	answer: string[];
	isCorrect?: boolean;
	score?: number;
};

// Computed on the client when a run ends, then submitted.
export type QuizResults = {
	totalScore: number;
	correctAnswers: number;
	totalQuestions: number;
	timeSpent: number;
	quizId: string;
	quizTitle: string;
	evaluationMode: EvaluationMode;
	questions: {
		id: string;
		content: string;
		options: string[] | null;
		correctAnswer: string[];
	}[];
	answers: {
		questionId: string;
		answer: string[];
		isCorrect: boolean;
		score: number;
	}[];
};

export type QuizAttemptResult = {
	id: string;
	score: number;
	timeSpent: number | null;
	completedAt: string;
	quiz: {
		id: string;
		quizMode: QuizMode;
		timeLimit: number | null;
		section: QuizSection;
		evaluationMode: EvaluationMode;
		questions: Omit<QuizQuestion, "order">[];
	};
	answers: {
		questionId: string;
		userAnswer: string[];
		score: number;
		isCorrect: boolean;
	}[];
};

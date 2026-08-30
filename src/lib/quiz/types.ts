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
	classId: string;
	className: string;
	courseName: string | null;
	departmentName: string | null;
	/** The codes the browse routes are built from — a breadcrumb needs the ancestors, not just this level. */
	departmentCode: string | null;
	courseCode: string | null;
	classCode: string | null;
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

/**
 * This attempt's place in the run of attempts on the same section, in the same
 * mode. The series stops at this attempt: the page is about this one, so "5º
 * tentativo" and "nuovo massimo" mean what they say even when the student has
 * since run the section again.
 */
export type AttemptHistory = {
	/** Oldest first, this attempt last. Capped — the tail is what is worth plotting. */
	points: { attemptId: string; score: number; completedAt: string }[];
	/** Mean grade over the run up to and including this attempt. */
	average: number;
	/** Which attempt this is, counting from the first. */
	position: number;
	/** True only when there was something to beat and this attempt beat it. */
	isPersonalBest: boolean;
	/** Mean seconds per answered question over the EARLIER attempts — null when there are none. */
	avgSecondsPerQuestion: number | null;
};

export type QuizAttemptResult = {
	id: string;
	score: number;
	timeSpent: number | null;
	completedAt: string;
	isFavorite: boolean;
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
	/** Null when the section is gone, or when nothing else was ever run on it. */
	history: AttemptHistory | null;
};

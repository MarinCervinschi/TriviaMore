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

/** The series stops at this attempt, even if the section was run again since. */
export type AttemptHistory = {
	/** Oldest first, this attempt last, capped. */
	points: { attemptId: string; score: number; completedAt: string }[];
	/** Mean grade up to and including this attempt. */
	average: number;
	position: number;
	/** True only when there was an earlier score and this attempt beat it. */
	isPersonalBest: boolean;
	/** Over the earlier attempts; null when there are none. */
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

export type OpenAttempt = {
	attemptId: string;
	quizId: string;
	quizMode: QuizMode;
	startedAt: string;
	sectionName: string;
	className: string;
};

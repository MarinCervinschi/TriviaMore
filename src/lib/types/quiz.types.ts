import { Difficulty, QuestionType, QuizMode } from "@prisma/client";

export interface QuizQuestion {
	id: string;
	content: string;
	questionType: QuestionType;
	options?: string[];
	correctAnswer: string[];
	explanation?: string;
	difficulty: Difficulty;
	order: number;
}

export interface QuizSection {
	id: string;
	name: string;
	class: {
		name: string;
		course: {
			name: string;
			department: {
				name: string;
			};
		};
	};
}

export interface Quiz {
	id: string;
	timeLimit?: number;
	evaluationMode: EvaluationMode;
	quizMode: QuizMode;
	section: QuizSection;
	questions: QuizQuestion[];
}

export interface EvaluationMode {
	name: string;
	description?: string;
	correctAnswerPoints: number;
	incorrectAnswerPoints: number;
	partialCreditEnabled: boolean;
}

export interface GuestQuizRequest {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	quizMode?: QuizMode;
}

export interface StartQuizRequest {
	userId: string;
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	quizMode: QuizMode;
	evaluationModeId: string;
}

export interface AnswerAttempt {
	questionId: string;
	userAnswer: string[];
	score: number;
}

export interface CompleteQuizRequest {
	userId: string;
	quizAttemptId: string;
	answers: AnswerAttempt[];
	totalScore: number;
	timeSpent: number;
}

export interface QuizResultQuestion {
	id: string;
	content: string;
	options?: string[];
	correctAnswer: string[];
}

export interface QuizResult {
	id: string;
	totalScore: number;
	correctAnswers: number;
	totalQuestions: number;
	timeSpent: number;
	quizId: string;
	quizTitle: string;
	questions: QuizResultQuestion[];
	evaluationMode: EvaluationMode;
	answers: Array<{
		questionId: string;
		answer: string[];
		isCorrect: boolean;
		score: number;
	}>;
}

// Interfaccia per le props del componente QuizResults
export interface QuizResultsComponentProps {
	results: QuizResult;
	onExit: () => void;
	onRetry?: () => void;
	showRetry?: boolean;
}

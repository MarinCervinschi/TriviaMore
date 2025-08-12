import { EvaluationMode, QuizQuestion } from "@/lib/types/quiz.types";

export interface UserAnswer {
	questionId: string;
	answer: string[];
	isCorrect?: boolean;
	score?: number;
}

export interface QuizResults {
	totalScore: number;
	correctAnswers: number;
	totalQuestions: number;
	timeSpent: number;
	answers: UserAnswer[];
	evaluationMode: EvaluationMode;
}

export interface CalculateResultsParams {
	userAnswers: UserAnswer[];
	questions: QuizQuestion[];
	evaluationMode: EvaluationMode;
	startTime: number;
}

export function calculateAnswerScore(
	userAnswer: string[],
	correctAnswer: string[],
	evaluationMode: EvaluationMode
): { score: number; isCorrect: boolean } {
	if (userAnswer.length === 0) {
		return { score: 0, isCorrect: false };
	}

	const correctGiven = userAnswer.filter(ans => correctAnswer.includes(ans)).length;
	const incorrectGiven = userAnswer.filter(ans => !correctAnswer.includes(ans)).length;
	const totalCorrect = correctAnswer.length;
	const totalGiven = userAnswer.length;

	if (
		correctGiven === totalCorrect &&
		incorrectGiven === 0 &&
		totalGiven === totalCorrect
	) {
		return {
			score: evaluationMode.correctAnswerPoints,
			isCorrect: true,
		};
	}

	if (correctGiven > 0) {
		if (evaluationMode.partialCreditEnabled) {
			const correctnessRatio = correctGiven / totalCorrect;
			const penaltyRatio = incorrectGiven / Math.max(totalGiven, 1);
			const adjustedRatio = Math.max(0, correctnessRatio - penaltyRatio);
			let score = Math.round(evaluationMode.correctAnswerPoints * adjustedRatio);

			if (incorrectGiven > 0) {
				const penalty = incorrectGiven * Math.abs(evaluationMode.incorrectAnswerPoints);
				score = Math.max(score - penalty, evaluationMode.incorrectAnswerPoints);
			}

			return { score, isCorrect: false };
		} else {
			return { score: 0, isCorrect: false };
		}
	}

	return {
		score: evaluationMode.incorrectAnswerPoints,
		isCorrect: false,
	};
}

export function calculateQuizResults(params: CalculateResultsParams): QuizResults {
	const { userAnswers, questions, evaluationMode, startTime } = params;

	let totalScore = 0;
	let correctAnswers = 0;

	const answersWithResults = userAnswers.map(userAnswer => {
		const question = questions.find(q => q.id === userAnswer.questionId);

		if (!question) {
			console.warn(`Question not found for ID: ${userAnswer.questionId}`);
			return userAnswer;
		}

		const { score, isCorrect } = calculateAnswerScore(
			userAnswer.answer,
			question.correctAnswer,
			evaluationMode
		);

		totalScore += score;
		if (isCorrect) {
			correctAnswers++;
		}

		return {
			...userAnswer,
			isCorrect,
			score,
		};
	});

	return {
		totalScore,
		correctAnswers,
		totalQuestions: questions.length,
		timeSpent: Date.now() - startTime,
		answers: answersWithResults,
		evaluationMode,
	};
}

export function calculateSuccessPercentage(results: QuizResults): number {
	if (results.totalQuestions === 0) return 0;
	return Math.round((results.correctAnswers / results.totalQuestions) * 100);
}

export function getPerformanceLevel(percentage: number): {
	level: "excellent" | "good" | "fair" | "poor";
	label: string;
	color: string;
} {
	if (percentage >= 90) {
		return { level: "excellent", label: "Eccellente", color: "green" };
	} else if (percentage >= 75) {
		return { level: "good", label: "Buono", color: "blue" };
	} else if (percentage >= 60) {
		return { level: "fair", label: "Sufficiente", color: "yellow" };
	} else {
		return { level: "poor", label: "Insufficiente", color: "red" };
	}
}

export function formatTimeSpent(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
	} else if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	} else {
		return `${seconds}s`;
	}
}

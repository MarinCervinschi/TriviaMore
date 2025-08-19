import { EvaluationMode, QuizQuestion, QuizResult } from "@/lib/types/quiz.types";

export interface UserAnswer {
	questionId: string;
	answer: string[];
	isCorrect?: boolean;
	score?: number;
}

export type QuizResults = QuizResult;

export interface CalculateResultsParams {
	userAnswers: UserAnswer[];
	questions: QuizQuestion[];
	evaluationMode: EvaluationMode;
	startTime: number;
	quizId: string;
	quizTitle: string;
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
			if (incorrectGiven > 0 && evaluationMode.incorrectAnswerPoints == 0) {
				return { score: 0, isCorrect: false };
			}

			const correctnessRatio = correctGiven / totalCorrect;
			let score = evaluationMode.correctAnswerPoints * correctnessRatio;

			if (incorrectGiven > 0 && evaluationMode.incorrectAnswerPoints < 0) {
				const penalty = incorrectGiven * Math.abs(evaluationMode.incorrectAnswerPoints);
				score = Math.max(score - penalty, evaluationMode.incorrectAnswerPoints);
			}

			score = Number(score.toFixed(2));

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
	const { userAnswers, questions, evaluationMode, startTime, quizId, quizTitle } =
		params;

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

	const maxScore = questions.length * evaluationMode.correctAnswerPoints;
	totalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 33) : 0;

	return {
		id: "",
		totalScore,
		correctAnswers,
		totalQuestions: questions.length,
		timeSpent: Date.now() - startTime,
		quizId,
		quizTitle,
		questions: questions.map(q => ({
			id: q.id,
			content: q.content,
			options: q.options,
			correctAnswer: q.correctAnswer,
		})),
		evaluationMode,
		answers: answersWithResults.map(answer => ({
			questionId: answer.questionId,
			answer: answer.answer,
			isCorrect: answer.isCorrect || false,
			score: answer.score || 0,
		})),
	};
}

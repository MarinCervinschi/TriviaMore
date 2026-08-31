import type { EvaluationMode } from "./types";

export const THIRTY_SCALE_MAX = 33;

/**
 * Maps raw evaluation-mode points onto the 0–33 normalized scale used in the
 * results page and in the start-quiz dialog summary.
 *
 * The total max is always {@link THIRTY_SCALE_MAX}, so each question is worth
 * `THIRTY_SCALE_MAX / N`. The min collapses to
 * `(incorrect_points / correct_points) * THIRTY_SCALE_MAX`, independent of N.
 */
export function getNormalizedEvaluationScale(
	evaluationMode: EvaluationMode,
	totalQuestions: number
) {
	const safeN = Math.max(1, totalQuestions);
	const minRatio =
		evaluationMode.correctAnswerPoints > 0
			? evaluationMode.incorrectAnswerPoints / evaluationMode.correctAnswerPoints
			: 0;
	const maxScaled = THIRTY_SCALE_MAX;
	const minScaled = Math.round(minRatio * THIRTY_SCALE_MAX);
	const perQuestionMax = maxScaled / safeN;
	const perQuestionMin = (minRatio * THIRTY_SCALE_MAX) / safeN;
	return {
		maxScaled,
		minScaled,
		perQuestionMax,
		perQuestionMin,
		hasPenalty: evaluationMode.incorrectAnswerPoints < 0,
	};
}

/**
 * Converts a single answer's raw score into its contribution on the 0–33 scale.
 */
export function scaleAnswerScore(
	rawScore: number,
	evaluationMode: EvaluationMode,
	totalQuestions: number
): number {
	if (evaluationMode.correctAnswerPoints <= 0) return 0;
	const safeN = Math.max(1, totalQuestions);
	const perQuestionMax = THIRTY_SCALE_MAX / safeN;
	return (rawScore / evaluationMode.correctAnswerPoints) * perQuestionMax;
}

export function formatScaledScore(n: number): string {
	if (n === 0) return "0";
	if (Number.isInteger(n)) return n.toString();
	return n.toFixed(2);
}

export function formatScaledSigned(n: number): string {
	const sign = n > 0 ? "+" : n < 0 ? "−" : "";
	return `${sign}${formatScaledScore(Math.abs(n))}`;
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

	// Exact match
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

	// Partial credit
	if (correctGiven > 0) {
		if (evaluationMode.partialCreditEnabled) {
			if (incorrectGiven > 0 && evaluationMode.incorrectAnswerPoints === 0) {
				return { score: 0, isCorrect: false };
			}

			const correctnessRatio = correctGiven / totalCorrect;
			let score = evaluationMode.correctAnswerPoints * correctnessRatio;

			if (incorrectGiven > 0 && evaluationMode.incorrectAnswerPoints < 0) {
				const penalty = incorrectGiven * Math.abs(evaluationMode.incorrectAnswerPoints);
				score = Math.max(score - penalty, evaluationMode.incorrectAnswerPoints);
			}

			return { score: Number(score.toFixed(2)), isCorrect: false };
		}
		return { score: 0, isCorrect: false };
	}

	return {
		score: evaluationMode.incorrectAnswerPoints,
		isCorrect: false,
	};
}

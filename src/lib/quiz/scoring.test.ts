import { afterEach, describe, expect, it, vi } from "vitest";

import {
	THIRTY_SCALE_MAX,
	calculateAnswerScore,
	calculateQuizResults,
	formatScaledScore,
	formatScaledSigned,
	getNormalizedEvaluationScale,
	scaleAnswerScore,
} from "./scoring";
import type { EvaluationMode, QuizQuestion, UserAnswer } from "./types";

function mode(overrides: Partial<EvaluationMode> = {}): EvaluationMode {
	return {
		id: "mode-1",
		name: "Standard",
		description: null,
		correctAnswerPoints: 1,
		incorrectAnswerPoints: 0,
		partialCreditEnabled: false,
		...overrides,
	};
}

function question(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
	return {
		id: "q1",
		content: "Domanda?",
		questionType: "MULTIPLE_CHOICE",
		options: ["a", "b", "c", "d"],
		correctAnswer: ["a"],
		explanation: null,
		difficulty: "MEDIUM",
		order: 0,
		...overrides,
	};
}

describe("calculateAnswerScore", () => {
	it("scores an empty answer as zero and incorrect", () => {
		expect(calculateAnswerScore([], ["a"], mode())).toEqual({
			score: 0,
			isCorrect: false,
		});
	});

	it("awards full points for an exact single-answer match", () => {
		expect(
			calculateAnswerScore(["a"], ["a"], mode({ correctAnswerPoints: 2 }))
		).toEqual({ score: 2, isCorrect: true });
	});

	it("awards full points for an exact multi-answer match regardless of order", () => {
		expect(calculateAnswerScore(["b", "a"], ["a", "b"], mode())).toEqual({
			score: 1,
			isCorrect: true,
		});
	});

	it("does not count a superset as an exact match", () => {
		// All correct answers given, but with an extra wrong one: not exact.
		const result = calculateAnswerScore(["a", "x"], ["a"], mode());
		expect(result.isCorrect).toBe(false);
	});

	it("gives zero for a partially-correct answer when partial credit is off", () => {
		expect(
			calculateAnswerScore(["a"], ["a", "b"], mode({ partialCreditEnabled: false }))
		).toEqual({ score: 0, isCorrect: false });
	});

	it("applies the incorrect-answer points when nothing correct is given", () => {
		expect(
			calculateAnswerScore(["x", "y"], ["a"], mode({ incorrectAnswerPoints: -0.5 }))
		).toEqual({ score: -0.5, isCorrect: false });
	});

	describe("partial credit enabled", () => {
		it("scales the score by the ratio of correct answers given", () => {
			expect(
				calculateAnswerScore(
					["a", "b"],
					["a", "b", "c", "d"],
					mode({ partialCreditEnabled: true })
				)
			).toEqual({ score: 0.5, isCorrect: false });
		});

		it("collapses to zero when a wrong answer is mixed in and there is no penalty", () => {
			expect(
				calculateAnswerScore(
					["a", "x"],
					["a", "b"],
					mode({ partialCreditEnabled: true, incorrectAnswerPoints: 0 })
				)
			).toEqual({ score: 0, isCorrect: false });
		});

		it("subtracts a penalty per wrong answer when the penalty is negative", () => {
			expect(
				calculateAnswerScore(
					["a", "x"],
					["a", "b"],
					mode({ partialCreditEnabled: true, incorrectAnswerPoints: -0.5 })
				)
			).toEqual({ score: 0, isCorrect: false });
		});

		it("clamps the penalised score to the incorrect-answer floor", () => {
			expect(
				calculateAnswerScore(
					["a", "x", "y", "z"],
					["a"],
					mode({ partialCreditEnabled: true, incorrectAnswerPoints: -0.5 })
				)
			).toEqual({ score: -0.5, isCorrect: false });
		});
	});
});

describe("getNormalizedEvaluationScale", () => {
	it("puts the max at THIRTY_SCALE_MAX and spreads it evenly per question", () => {
		const scale = getNormalizedEvaluationScale(mode(), 10);
		expect(scale.maxScaled).toBe(THIRTY_SCALE_MAX);
		expect(scale.perQuestionMax).toBeCloseTo(3.3);
		expect(scale.minScaled).toBe(0);
		expect(scale.hasPenalty).toBe(false);
	});

	it("derives a negative floor from the penalty ratio", () => {
		const scale = getNormalizedEvaluationScale(
			mode({ incorrectAnswerPoints: -0.5 }),
			10
		);
		expect(scale.minScaled).toBe(-16);
		expect(scale.perQuestionMin).toBeCloseTo(-1.65);
		expect(scale.hasPenalty).toBe(true);
	});

	it("treats zero questions as one to avoid dividing by zero", () => {
		const scale = getNormalizedEvaluationScale(mode(), 0);
		expect(scale.perQuestionMax).toBe(THIRTY_SCALE_MAX);
	});

	it("guards against a zero correct-answer weight", () => {
		const scale = getNormalizedEvaluationScale(
			mode({ correctAnswerPoints: 0, incorrectAnswerPoints: -1 }),
			5
		);
		expect(scale.minScaled).toBe(0);
		expect(scale.perQuestionMin).toBe(0);
	});
});

describe("scaleAnswerScore", () => {
	it("maps a full raw point to the per-question max", () => {
		expect(scaleAnswerScore(1, mode(), 10)).toBeCloseTo(3.3);
	});

	it("maps a fractional raw score proportionally", () => {
		expect(scaleAnswerScore(0.5, mode(), 10)).toBeCloseTo(1.65);
	});

	it("returns zero when the correct-answer weight is not positive", () => {
		expect(scaleAnswerScore(5, mode({ correctAnswerPoints: 0 }), 10)).toBe(0);
	});
});

describe("formatScaledScore", () => {
	it.each([
		[0, "0"],
		[5, "5"],
		[3.3, "3.30"],
		[1.5, "1.50"],
	])("formats %d as %s", (input, expected) => {
		expect(formatScaledScore(input)).toBe(expected);
	});
});

describe("formatScaledSigned", () => {
	it("prefixes a positive value with a plus", () => {
		expect(formatScaledSigned(3.3)).toBe("+3.30");
	});

	it("prefixes a negative value with a unicode minus and formats the magnitude", () => {
		expect(formatScaledSigned(-1.65)).toBe("−1.65");
	});

	it("leaves zero unsigned", () => {
		expect(formatScaledSigned(0)).toBe("0");
	});
});

describe("calculateQuizResults", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("aggregates per-answer scores and normalizes to the thirty scale", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(5000));

		const questions = [
			question({ id: "q1", correctAnswer: ["a"] }),
			question({ id: "q2", correctAnswer: ["b"] }),
		];
		const userAnswers: UserAnswer[] = [
			{ questionId: "q1", answer: ["a"] },
			{ questionId: "q2", answer: ["x"] },
		];

		const result = calculateQuizResults({
			userAnswers,
			questions,
			evaluationMode: mode(),
			startTime: 1000,
			quizId: "quiz-1",
			quizTitle: "Quiz",
		});

		expect(result.correctAnswers).toBe(1);
		expect(result.totalQuestions).toBe(2);
		// 1 raw point of a 2-point max → round(0.5 * 33) = 17
		expect(result.totalScore).toBe(17);
		expect(result.timeSpent).toBe(4000);
		expect(result.answers).toEqual([
			{ questionId: "q1", answer: ["a"], isCorrect: true, score: 1 },
			{ questionId: "q2", answer: ["x"], isCorrect: false, score: 0 },
		]);
	});

	it("scores an answer whose question is missing as zero", () => {
		const result = calculateQuizResults({
			userAnswers: [{ questionId: "ghost", answer: ["a"] }],
			questions: [question({ id: "q1" })],
			evaluationMode: mode(),
			startTime: 0,
			quizId: "quiz-1",
			quizTitle: "Quiz",
		});

		expect(result.correctAnswers).toBe(0);
		expect(result.answers).toEqual([
			{ questionId: "ghost", answer: ["a"], isCorrect: false, score: 0 },
		]);
	});

	it("normalizes to zero when the max score is not positive", () => {
		const result = calculateQuizResults({
			userAnswers: [{ questionId: "q1", answer: ["a"] }],
			questions: [question({ id: "q1", correctAnswer: ["a"] })],
			evaluationMode: mode({ correctAnswerPoints: 0 }),
			startTime: 0,
			quizId: "quiz-1",
			quizTitle: "Quiz",
		});

		expect(result.totalScore).toBe(0);
	});
});

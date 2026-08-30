import { describe, expect, it } from "vitest";

import { summariseAttempt } from "./results";
import type { EvaluationMode, QuizAttemptResult } from "./types";

const STANDARD: EvaluationMode = {
	id: "standard",
	name: "Standard",
	description: null,
	correctAnswerPoints: 1,
	incorrectAnswerPoints: 0,
	partialCreditEnabled: true,
};

const PENALTY: EvaluationMode = {
	...STANDARD,
	id: "penalty",
	incorrectAnswerPoints: -0.5,
};

function question(id: string, difficulty: "EASY" | "MEDIUM" | "HARD") {
	return {
		id,
		content: id,
		questionType: "MULTIPLE_CHOICE" as const,
		options: ["a", "b"],
		correctAnswer: ["a"],
		explanation: null,
		difficulty,
	};
}

function attempt(
	evaluationMode: EvaluationMode,
	questions: ReturnType<typeof question>[],
	answers: QuizAttemptResult["answers"]
): QuizAttemptResult {
	return {
		id: "attempt",
		score: 0,
		timeSpent: null,
		completedAt: "2026-08-27T18:42:00Z",
		isFavorite: false,
		quiz: {
			id: "quiz",
			quizMode: "STUDY",
			timeLimit: null,
			section: {
				id: "section",
				name: "Alberi e grafi",
				classId: "class",
				className: "Algoritmi",
				courseName: null,
				departmentName: null,
				departmentCode: null,
				courseCode: null,
				classCode: null,
				path: null,
			},
			evaluationMode,
			questions,
		},
		answers,
		history: null,
	};
}

describe("summariseAttempt", () => {
	it("counts a blank answer apart from a wrong one", () => {
		const summary = summariseAttempt(
			attempt(
				STANDARD,
				[question("q1", "EASY"), question("q2", "EASY"), question("q3", "EASY")],
				[
					{ questionId: "q1", userAnswer: ["a"], score: 1, isCorrect: true },
					{ questionId: "q2", userAnswer: ["b"], score: 0, isCorrect: false },
					{ questionId: "q3", userAnswer: [], score: 0, isCorrect: false },
				]
			)
		);

		expect(summary).toMatchObject({
			total: 3,
			correct: 1,
			partial: 0,
			wrong: 1,
			unanswered: 1,
		});
	});

	it("treats a question with no answer row at all as blank", () => {
		const summary = summariseAttempt(
			attempt(STANDARD, [question("q1", "EASY"), question("q2", "EASY")], [])
		);
		expect(summary.unanswered).toBe(2);
		expect(summary.wrong).toBe(0);
	});

	it("splits the points into what was earned and what the penalty took back", () => {
		const summary = summariseAttempt(
			attempt(
				PENALTY,
				[question("q1", "EASY"), question("q2", "EASY"), question("q3", "EASY")],
				[
					{ questionId: "q1", userAnswer: ["a"], score: 1, isCorrect: true },
					{ questionId: "q2", userAnswer: ["b"], score: -0.5, isCorrect: false },
					{ questionId: "q3", userAnswer: [], score: 0, isCorrect: false },
				]
			)
		);

		// 33 over three questions is 11 a question, and the penalty is half of that.
		expect(summary.earned).toBeCloseTo(11);
		expect(summary.lost).toBeCloseTo(5.5);
		expect(summary.hasPenalty).toBe(true);
	});

	it("has no penalty to report when a wrong answer is worth zero", () => {
		const summary = summariseAttempt(
			attempt(
				STANDARD,
				[question("q1", "EASY")],
				[{ questionId: "q1", userAnswer: ["b"], score: 0, isCorrect: false }]
			)
		);
		expect(summary.hasPenalty).toBe(false);
		expect(summary.lost).toBe(0);
	});

	it("scores partial credit as partial, not as correct", () => {
		const summary = summariseAttempt(
			attempt(
				STANDARD,
				[question("q1", "MEDIUM")],
				[{ questionId: "q1", userAnswer: ["a"], score: 0.5, isCorrect: false }]
			)
		);
		expect(summary.partial).toBe(1);
		expect(summary.correct).toBe(0);
		expect(summary.rows[0]!.verdict).toBe("partial");
	});

	it("groups accuracy by difficulty, easy to hard", () => {
		const summary = summariseAttempt(
			attempt(
				STANDARD,
				[question("q1", "HARD"), question("q2", "EASY"), question("q3", "EASY")],
				[
					{ questionId: "q1", userAnswer: ["b"], score: 0, isCorrect: false },
					{ questionId: "q2", userAnswer: ["a"], score: 1, isCorrect: true },
					{ questionId: "q3", userAnswer: ["a"], score: 1, isCorrect: true },
				]
			)
		);

		expect(summary.byDifficulty).toEqual([
			{ key: "EASY", total: 2, correct: 2 },
			{ key: "HARD", total: 1, correct: 0 },
		]);
	});

	it("ignores an answer whose question is no longer in the quiz", () => {
		const summary = summariseAttempt(
			attempt(
				STANDARD,
				[question("q1", "EASY")],
				[
					{ questionId: "q1", userAnswer: ["a"], score: 1, isCorrect: true },
					{ questionId: "gone", userAnswer: ["a"], score: 1, isCorrect: true },
				]
			)
		);
		expect(summary.total).toBe(1);
		expect(summary.correct).toBe(1);
		expect(summary.earned).toBeCloseTo(33);
	});
});

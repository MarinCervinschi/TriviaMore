import type { MasteryBreakdown } from "@/lib/user/types";

import { getNormalizedEvaluationScale, scaleAnswerScore } from "./scoring";
import type { QuizAttemptResult, QuizQuestion } from "./types";

export type ReviewVerdict = "correct" | "partial" | "wrong" | "unanswered";

export type AttemptRow = {
	question: Omit<QuizQuestion, "order">;
	userAnswer: string[];
	verdict: ReviewVerdict;
	/** The answer's contribution on the 0–33 scale. */
	scaledScore: number;
};

export type AttemptSummary = {
	total: number;
	correct: number;
	partial: number;
	wrong: number;
	/** Left blank, which under a penalty differs from wrong. */
	unanswered: number;
	/** On the 0–33 scale. */
	earned: number;
	/** A positive number on the 0–33 scale. */
	lost: number;
	hasPenalty: boolean;
	perQuestionMax: number;
	perQuestionMin: number;
	byDifficulty: MasteryBreakdown[];
	/** In the order the quiz asked them. */
	rows: AttemptRow[];
};

const DIFFICULTY_ORDER = ["EASY", "MEDIUM", "HARD"];

/** Reads the verdicts frozen at submission and drops answers whose question left the quiz. */
export function summariseAttempt(result: QuizAttemptResult): AttemptSummary {
	const questions = result.quiz.questions;
	const total = questions.length;
	const evaluationMode = result.quiz.evaluationMode;
	const scale = getNormalizedEvaluationScale(evaluationMode, total);
	const byId = new Map(result.answers.map(answer => [answer.questionId, answer]));

	const counts = { correct: 0, partial: 0, wrong: 0, unanswered: 0 };
	const difficulty = new Map<string, { total: number; correct: number }>();
	let earned = 0;
	let lost = 0;

	const rows = questions.map(question => {
		const answer = byId.get(question.id);
		const score = answer?.score ?? 0;
		const isCorrect = answer?.isCorrect ?? false;
		const userAnswer = answer?.userAnswer ?? [];
		const verdict = answerVerdict({
			isCorrect,
			score,
			answered: userAnswer.length > 0,
		});
		counts[verdict]++;

		if (question.difficulty) {
			const row = difficulty.get(question.difficulty) ?? { total: 0, correct: 0 };
			row.total++;
			if (isCorrect) row.correct++;
			difficulty.set(question.difficulty, row);
		}

		const scaledScore = scaleAnswerScore(score, evaluationMode, total);
		if (scaledScore > 0) earned += scaledScore;
		else lost -= scaledScore;

		return { question, userAnswer, verdict, scaledScore };
	});

	return {
		total,
		...counts,
		earned,
		lost,
		hasPenalty: scale.hasPenalty,
		perQuestionMax: scale.perQuestionMax,
		perQuestionMin: scale.perQuestionMin,
		byDifficulty: [...difficulty.entries()]
			.map(([key, row]) => ({ key, ...row }))
			.sort(
				(a, b) => DIFFICULTY_ORDER.indexOf(a.key) - DIFFICULTY_ORDER.indexOf(b.key)
			),
		rows,
	};
}

function answerVerdict({
	isCorrect,
	score,
	answered,
}: {
	isCorrect: boolean;
	score: number;
	answered: boolean;
}): ReviewVerdict {
	if (isCorrect) return "correct";
	if (score > 0) return "partial";
	return answered ? "wrong" : "unanswered";
}

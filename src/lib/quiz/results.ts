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
	/** Left blank. With a penalty this is not the same thing as wrong, and it is why the two are counted apart. */
	unanswered: number;
	/** Points the correct and partial answers earned, on the 0–33 scale. */
	earned: number;
	/** Points the penalty took back, as a positive number on the same scale. */
	lost: number;
	hasPenalty: boolean;
	perQuestionMax: number;
	perQuestionMin: number;
	byDifficulty: MasteryBreakdown[];
	/** One per question, in the order the quiz asked them. */
	rows: AttemptRow[];
};

const DIFFICULTY_ORDER = ["EASY", "MEDIUM", "HARD"];

/**
 * Reads an attempt as it was graded, not as the questions stand now: the verdict
 * and the score are the ones frozen on the answer at submission, so editing a
 * question's correct answer later cannot rewrite a past result.
 *
 * Answers whose question is no longer in the quiz are dropped — the quiz is the
 * list of questions the student was actually asked.
 */
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

/** The verdict as it was frozen: correctness first, then partial credit, then whether anything was picked at all. */
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

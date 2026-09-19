import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import {
	answerAttempts,
	bookmarks,
	flashcardAttempts,
	questions,
	quizAttempts,
	userDayActivity,
} from "@/db/schema";
import {
	findCurrentEnrollment,
	insertEnrollment,
	setEnrollmentCurrent,
} from "@/lib/crm/db/enrollments";
import { insertFlashcardAttempt } from "@/lib/flashcard/db/flashcard-attempts";
import { type TestTx, closeTestDb, withRollback } from "@/lib/testing/db";
import { createCourse, createDepartment, seedQuizScope } from "@/lib/testing/fixtures";

import { backfillRollups } from "./db/backfill";
import { readMetricSnapshots } from "./db/metrics";
import { recomputeMetricSnapshots } from "./db/recompute";
import { applyQuizActivity } from "./db/rollups";
import type { MetricSnapshot } from "./types";

async function createQuestion(
	tx: TestTx,
	sectionId: string,
	difficulty: "HARD" | "EASY"
) {
	const [row] = await tx
		.insert(questions)
		.values({
			content: `Domanda ${crypto.randomUUID().slice(0, 8)}`,
			questionType: "SHORT_ANSWER",
			correctAnswer: ["x"],
			difficulty,
			sectionId,
		})
		.returning({ id: questions.id });
	return row.id;
}

/** One completed attempt with its answers — the history a rollup must match. */
async function recordAttempt(
	tx: TestTx,
	params: {
		userId: string;
		sectionId: string;
		score: number;
		answers: { questionId: string; isCorrect: boolean; difficulty: "HARD" | "EASY" }[];
	}
) {
	const [attempt] = await tx
		.insert(quizAttempts)
		.values({
			userId: params.userId,
			sectionId: params.sectionId,
			score: params.score,
			quizMode: "STUDY",
			timeSpent: 60_000,
			completedAt: new Date().toISOString(),
		})
		.returning({ id: quizAttempts.id });

	if (params.answers.length === 0) return attempt.id;

	await tx.insert(answerAttempts).values(
		params.answers.map(answer => ({
			quizAttemptId: attempt.id,
			questionId: answer.questionId,
			sectionId: params.sectionId,
			difficulty: answer.difficulty,
			isCorrect: answer.isCorrect,
			userAnswer: ["x"],
			score: answer.isCorrect ? 1 : 0,
		}))
	);

	return attempt.id;
}

async function snapshots(tx: TestTx, userId: string) {
	const [stored] = await readMetricSnapshots(tx, userId);
	const [computed] = await recomputeMetricSnapshots(tx, userId);
	return { stored: stored!.metrics, computed: computed!.metrics };
}

/** Everything except the rank, which the rollup path fills lazily by design. */
function comparable(metrics: MetricSnapshot) {
	const { SIGNUP_RANK: _rank, ...rest } = metrics;
	return rest;
}

describe("user rollups agree with the history they derive from", () => {
	afterAll(closeTestDb);

	it("matches the recompute after a backfill", async () => {
		await withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const hard = await createQuestion(tx, scope.sectionId, "HARD");
			const easy = await createQuestion(tx, scope.sectionId, "EASY");

			await tx.insert(bookmarks).values({ userId: scope.owner, questionId: easy });

			await recordAttempt(tx, {
				userId: scope.owner,
				sectionId: scope.sectionId,
				score: 20,
				answers: [
					{ questionId: hard, isCorrect: true, difficulty: "HARD" },
					{ questionId: easy, isCorrect: true, difficulty: "EASY" },
				],
			});
			await tx.insert(flashcardAttempts).values({
				userId: scope.owner,
				sessionId: `s-${crypto.randomUUID().slice(0, 8)}`,
				sectionId: scope.sectionId,
				cardsReviewed: 5,
			});

			await backfillRollups(tx);

			const { stored, computed } = await snapshots(tx, scope.owner);
			expect(comparable(stored)).toEqual(comparable(computed));
			expect(stored.HARD_CORRECT).toBe(1);
			expect(stored.BOOKMARKED_THEN_CORRECT).toBe(1);
			expect(stored.FLASHCARD_SESSIONS).toBe(1);
			expect(stored.DISTINCT_SECTIONS).toBe(1);
		});
	});

	it("matches the recompute when written incrementally", async () => {
		await withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const hard = await createQuestion(tx, scope.sectionId, "HARD");

			for (const score of [10, 20, 30]) {
				const answers = [
					{ questionId: hard, isCorrect: true, difficulty: "HARD" as const },
				];
				await recordAttempt(tx, {
					userId: scope.owner,
					sectionId: scope.sectionId,
					score,
					answers,
				});
				await applyQuizActivity(tx, {
					userId: scope.owner,
					sectionId: scope.sectionId,
					quizMode: "STUDY",
					score,
					timeSpentMs: 60_000,
					answers,
				});
			}

			const { stored, computed } = await snapshots(tx, scope.owner);
			expect(comparable(stored)).toEqual(comparable(computed));
			// The same HARD question three times is one distinct question, and the
			// improvement is the first-to-last delta over three runs.
			expect(stored.HARD_CORRECT).toBe(1);
			expect(stored.QUIZZES_COMPLETED).toBe(3);
			expect(stored.MAX_SECTION_IMPROVEMENT).toBe(20);
		});
	});

	it("drops an active day the history does not justify", async () => {
		await withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await recordAttempt(tx, {
				userId: scope.owner,
				sectionId: scope.sectionId,
				score: 30,
				answers: [],
			});
			await tx
				.insert(userDayActivity)
				.values({ userId: scope.owner, day: "2020-01-01", flashcards: 1 });

			await backfillRollups(tx);

			const days = await tx
				.select({ day: userDayActivity.day })
				.from(userDayActivity)
				.where(eq(userDayActivity.userId, scope.owner));
			expect(days.map(row => row.day)).not.toContain("2020-01-01");
		});
	});

	it("records a replayed flashcard session once", async () => {
		await withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const attempt = {
				userId: scope.owner,
				sessionId: `s-${crypto.randomUUID().slice(0, 8)}`,
				sectionId: scope.sectionId,
				cardsReviewed: 5,
			};

			expect(await insertFlashcardAttempt(tx, attempt)).toBe(true);
			expect(await insertFlashcardAttempt(tx, attempt)).toBe(false);
		});
	});

	it("reports the stored signup rank once the rollup path has run", async () => {
		await withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await recordAttempt(tx, {
				userId: scope.owner,
				sectionId: scope.sectionId,
				score: 30,
				answers: [],
			});
			await applyQuizActivity(tx, {
				userId: scope.owner,
				sectionId: scope.sectionId,
				quizMode: "STUDY",
				score: 30,
				timeSpentMs: 0,
				answers: [],
			});

			const { stored, computed } = await snapshots(tx, scope.owner);
			expect(stored.SIGNUP_RANK).toBe(computed.SIGNUP_RANK);
			expect(Number.isFinite(stored.SIGNUP_RANK)).toBe(true);
		});
	});

	// The one metric with no rollup: both sides read crm.enrollments, so this
	// asserts the rule rather than the agreement — which holds by construction.
	it("declares an enrolment, and follows the current one", async () => {
		await withRollback(async tx => {
			const scope = await seedQuizScope(tx);

			const before = await snapshots(tx, scope.owner);
			expect(before.stored.ENROLLMENT_DECLARED).toBe(0);
			expect(before.computed.ENROLLMENT_DECLARED).toBe(0);

			const courseId = await createCourse(tx, await createDepartment(tx));
			await insertEnrollment(tx, { userId: scope.owner, courseId });

			const after = await snapshots(tx, scope.owner);
			expect(after.stored.ENROLLMENT_DECLARED).toBe(1);
			expect(after.computed.ENROLLMENT_DECLARED).toBe(1);

			// A row kept only as history does not count as a declaration.
			const row = await findCurrentEnrollment(tx, scope.owner);
			await setEnrollmentCurrent(tx, row!.id, false);

			const demoted = await snapshots(tx, scope.owner);
			expect(demoted.stored.ENROLLMENT_DECLARED).toBe(0);
			expect(demoted.computed.ENROLLMENT_DECLARED).toBe(0);
		});
	});
});

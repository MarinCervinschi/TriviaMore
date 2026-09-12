import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { quizAttempts, quizzes } from "@/db/schema";
import type { TestTx } from "@/lib/testing/db";
import { closeTestDb, withRollback } from "@/lib/testing/db";
import type { QuizScope } from "@/lib/testing/fixtures";
import { seedQuizScope } from "@/lib/testing/fixtures";

import { abandonedAttemptCutoff } from "../constants";
import { deleteStaleOpenAttempts, insertAttempt } from "./attempts";
import { deleteOrphanQuizzes } from "./quizzes";

afterAll(() => closeTestDb());

const CUTOFF = abandonedAttemptCutoff();
const LONG_AGO = "2020-01-01T00:00:00.000Z";

async function createQuiz(tx: TestTx, scope: QuizScope): Promise<string> {
	const [quiz] = await tx
		.insert(quizzes)
		.values({
			sectionId: scope.sectionId,
			evaluationModeId: scope.evaluationModeId,
			quizMode: "STUDY",
		})
		.returning({ id: quizzes.id });
	return quiz.id;
}

async function createAttempt(
	tx: TestTx,
	params: { userId: string; quizId: string; startedAt?: string; completedAt?: string }
): Promise<string> {
	const { id } = await insertAttempt(tx, {
		userId: params.userId,
		quizId: params.quizId,
	});
	if (params.startedAt || params.completedAt) {
		await tx
			.update(quizAttempts)
			.set({
				...(params.startedAt ? { startedAt: params.startedAt } : {}),
				...(params.completedAt ? { completedAt: params.completedAt } : {}),
			})
			.where(eq(quizAttempts.id, id));
	}
	return id;
}

function survivors(tx: TestTx, ids: string[]) {
	return tx
		.select({ id: quizAttempts.id })
		.from(quizAttempts)
		.where(inArray(quizAttempts.id, ids))
		.then(rows => rows.map(row => row.id));
}

describe("deleteStaleOpenAttempts", () => {
	it("takes an unfinished attempt left open past the horizon", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			const stale = await createAttempt(tx, {
				userId: scope.owner,
				quizId,
				startedAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF)).toEqual([quizId]);
			expect(await survivors(tx, [stale])).toEqual([]);
		}));

	it("leaves an attempt started inside the horizon alone", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const fresh = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF)).toEqual([]);
			expect(await survivors(tx, [fresh])).toEqual([fresh]);
		}));

	// A cutoff is not an authorization check: nothing but the user id keeps the
	// reap off another student's unfinished quiz.
	it("never touches another user's stale attempt", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const theirs = await createAttempt(tx, {
				userId: scope.stranger,
				quizId: await createQuiz(tx, scope),
				startedAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF)).toEqual([]);
			expect(await survivors(tx, [theirs])).toEqual([theirs]);
		}));

	it("never touches a completed attempt, however old", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const done = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
				startedAt: LONG_AGO,
				completedAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF)).toEqual([]);
			expect(await survivors(tx, [done])).toEqual([done]);
		}));

	it("reports the quiz behind each attempt it takes", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const first = await createQuiz(tx, scope);
			const second = await createQuiz(tx, scope);
			await createAttempt(tx, {
				userId: scope.owner,
				quizId: first,
				startedAt: LONG_AGO,
			});
			await createAttempt(tx, {
				userId: scope.owner,
				quizId: second,
				startedAt: LONG_AGO,
			});

			const reaped = await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF);
			expect([...reaped].sort()).toEqual([first, second].sort());
		}));
});

describe("deleteOrphanQuizzes", () => {
	it("drops a quiz no attempt points at any more", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			await createAttempt(tx, { userId: scope.owner, quizId, startedAt: LONG_AGO });

			await deleteOrphanQuizzes(
				tx,
				await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF)
			);

			const left = await tx
				.select({ id: quizzes.id })
				.from(quizzes)
				.where(eq(quizzes.id, quizId));
			expect(left).toEqual([]);
		}));

	it("keeps a quiz another attempt still holds", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			await createAttempt(tx, { userId: scope.owner, quizId, startedAt: LONG_AGO });
			const live = await createAttempt(tx, { userId: scope.owner, quizId });

			await deleteOrphanQuizzes(
				tx,
				await deleteStaleOpenAttempts(tx, scope.owner, CUTOFF)
			);

			const left = await tx
				.select({ id: quizzes.id })
				.from(quizzes)
				.where(eq(quizzes.id, quizId));
			expect(left.map(row => row.id)).toEqual([quizId]);
			expect(await survivors(tx, [live])).toEqual([live]);
		}));

	it("does nothing when handed no quizzes", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);

			await deleteOrphanQuizzes(tx, []);

			const left = await tx
				.select({ id: quizzes.id })
				.from(quizzes)
				.where(eq(quizzes.id, quizId));
			expect(left.map(row => row.id)).toEqual([quizId]);
		}));
});

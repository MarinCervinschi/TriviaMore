import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { quizAttempts, quizzes } from "@/db/schema";
import type { TestTx } from "@/lib/testing/db";
import { closeTestDb, withRollback } from "@/lib/testing/db";
import type { QuizScope } from "@/lib/testing/fixtures";
import { seedQuizScope } from "@/lib/testing/fixtures";

import {
	deleteStaleOpenAttempts,
	findOpenAttemptForUser,
	insertAttempt,
	isOpenAttemptViolation,
	touchOpenAttempt,
} from "./attempts";
import { deleteOrphanQuizzes, insertQuiz } from "./quizzes";

afterAll(() => closeTestDb());

const LONG_AGO = "2020-01-01T00:00:00.000Z";

async function createQuiz(tx: TestTx, scope: QuizScope): Promise<string> {
	const quiz = await insertQuiz(tx, {
		sectionId: scope.sectionId,
		evaluationModeId: scope.evaluationModeId,
		quizMode: "STUDY",
		timeLimit: null,
	});
	return quiz.id;
}

async function createAttempt(
	tx: TestTx,
	params: {
		userId: string;
		quizId: string;
		startedAt?: string;
		lastSeenAt?: string;
		completedAt?: string;
	}
): Promise<string> {
	const { id } = await insertAttempt(tx, {
		userId: params.userId,
		quizId: params.quizId,
	});
	if (params.startedAt || params.lastSeenAt || params.completedAt) {
		await tx
			.update(quizAttempts)
			.set({
				...(params.startedAt ? { startedAt: params.startedAt } : {}),
				...(params.lastSeenAt ? { lastSeenAt: params.lastSeenAt } : {}),
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

describe("one open attempt per user", () => {
	it("refuses a second one", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
			});
			const second = await createQuiz(tx, scope);

			// A savepoint, or the violation would poison the surrounding transaction.
			const rejection = await tx
				.transaction(nested =>
					createAttempt(nested, { userId: scope.owner, quizId: second })
				)
				.catch((error: unknown) => error);

			expect(isOpenAttemptViolation(rejection)).toBe(true);
		}));

	it("counts only the unfinished ones", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
				completedAt: LONG_AGO,
			});

			const open = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
			});
			expect(await survivors(tx, [open])).toEqual([open]);
		}));

	it("is held per user, not globally", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const mine = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
			});
			const theirs = await createAttempt(tx, {
				userId: scope.stranger,
				quizId: await createQuiz(tx, scope),
			});

			expect((await survivors(tx, [mine, theirs])).sort()).toEqual(
				[mine, theirs].sort()
			);
		}));
});

describe("findOpenAttemptForUser", () => {
	it("gives back the unfinished quiz and where it lives", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			const attemptId = await createAttempt(tx, { userId: scope.owner, quizId });

			expect(await findOpenAttemptForUser(tx, scope.owner)).toMatchObject({
				attemptId,
				quizId,
				quizMode: "STUDY",
				className: "Insegnamento Test",
				isStale: false,
			});
		}));

	it("ignores a completed attempt", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
				completedAt: LONG_AGO,
			});

			expect(await findOpenAttemptForUser(tx, scope.owner)).toBeUndefined();
		}));

	it("ignores another user's open attempt", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await createAttempt(tx, {
				userId: scope.stranger,
				quizId: await createQuiz(tx, scope),
			});

			expect(await findOpenAttemptForUser(tx, scope.owner)).toBeUndefined();
		}));

	// The inner join is what does this: deleting the quiz nulls `quiz_id`, and an
	// attempt with nothing to resume must not stand in the way of a new quiz.
	it("ignores an attempt whose quiz is gone", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			await createAttempt(tx, { userId: scope.owner, quizId });

			await tx.delete(quizzes).where(eq(quizzes.id, quizId));

			expect(await findOpenAttemptForUser(tx, scope.owner)).toBeUndefined();
		}));

	it("flags one left past the horizon as stale", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
				lastSeenAt: LONG_AGO,
			});

			expect(await findOpenAttemptForUser(tx, scope.owner)).toMatchObject({
				isStale: true,
			});
		}));
});

describe("touchOpenAttempt", () => {
	it("pushes the horizon out for the attempt it finds", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			const attemptId = await createAttempt(tx, {
				userId: scope.owner,
				quizId,
				lastSeenAt: LONG_AGO,
			});

			expect(await touchOpenAttempt(tx, scope.owner, quizId)).toBe(attemptId);
			expect(await deleteStaleOpenAttempts(tx, scope.owner)).toEqual([]);
			expect(await survivors(tx, [attemptId])).toEqual([attemptId]);
		}));

	it("finds nothing of another user's", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			await createAttempt(tx, { userId: scope.stranger, quizId });

			expect(await touchOpenAttempt(tx, scope.owner, quizId)).toBeUndefined();
		}));

	it("finds nothing once the attempt is completed", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			await createAttempt(tx, {
				userId: scope.owner,
				quizId,
				completedAt: LONG_AGO,
			});

			expect(await touchOpenAttempt(tx, scope.owner, quizId)).toBeUndefined();
		}));
});

describe("deleteStaleOpenAttempts", () => {
	it("takes an unfinished attempt left unseen past the horizon", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			const stale = await createAttempt(tx, {
				userId: scope.owner,
				quizId,
				lastSeenAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner)).toEqual([quizId]);
			expect(await survivors(tx, [stale])).toEqual([]);
		}));

	it("leaves an attempt seen inside the horizon alone", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const fresh = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner)).toEqual([]);
			expect(await survivors(tx, [fresh])).toEqual([fresh]);
		}));

	// The reason the horizon reads `last_seen_at` and not `started_at`: a quiz
	// picked up again every day is in use, however long ago it was begun.
	it("leaves an old attempt alone when it was just resumed", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const resumed = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
				startedAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner)).toEqual([]);
			expect(await survivors(tx, [resumed])).toEqual([resumed]);
		}));

	// A cutoff is not an authorization check: nothing but the user id keeps the
	// reap off another student's unfinished quiz.
	it("never touches another user's stale attempt", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const theirs = await createAttempt(tx, {
				userId: scope.stranger,
				quizId: await createQuiz(tx, scope),
				lastSeenAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner)).toEqual([]);
			expect(await survivors(tx, [theirs])).toEqual([theirs]);
		}));

	it("never touches a completed attempt, however old", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const done = await createAttempt(tx, {
				userId: scope.owner,
				quizId: await createQuiz(tx, scope),
				lastSeenAt: LONG_AGO,
				completedAt: LONG_AGO,
			});

			expect(await deleteStaleOpenAttempts(tx, scope.owner)).toEqual([]);
			expect(await survivors(tx, [done])).toEqual([done]);
		}));
});

describe("deleteOrphanQuizzes", () => {
	it("drops a quiz no attempt points at any more", () =>
		withRollback(async tx => {
			const scope = await seedQuizScope(tx);
			const quizId = await createQuiz(tx, scope);
			await createAttempt(tx, { userId: scope.owner, quizId, lastSeenAt: LONG_AGO });

			await deleteOrphanQuizzes(tx, await deleteStaleOpenAttempts(tx, scope.owner));

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
			await createAttempt(tx, { userId: scope.owner, quizId, lastSeenAt: LONG_AGO });
			const held = await createAttempt(tx, {
				userId: scope.stranger,
				quizId,
				completedAt: LONG_AGO,
			});

			await deleteOrphanQuizzes(tx, await deleteStaleOpenAttempts(tx, scope.owner));

			const left = await tx
				.select({ id: quizzes.id })
				.from(quizzes)
				.where(eq(quizzes.id, quizId));
			expect(left.map(row => row.id)).toEqual([quizId]);
			expect(await survivors(tx, [held])).toEqual([held]);
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

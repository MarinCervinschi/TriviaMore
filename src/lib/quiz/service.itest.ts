import { and, eq } from "drizzle-orm";
import { afterAll, describe, expect, it, vi } from "vitest";

import { evaluationModes, sectionAccess } from "@/db/schema";
import { Forbidden } from "@/lib/server/errors";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";
import {
	type SectionCountScope,
	createQuestion,
	createUser,
	seedSectionCountScope,
} from "@/lib/testing/fixtures";

import { completeQuiz, getQuiz, getQuizResults, startQuiz } from "./service";

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/achievements/service", () => ({
	evaluateAchievementsSafely: vi.fn(async () => []),
}));

afterAll(() => closeTestDb());

type Seeded = SectionCountScope & {
	evaluationModeId: string;
	publicQuestion: string;
	privateQuestion: string;
};

async function seed(tx: TestTx): Promise<Seeded> {
	const scope = await seedSectionCountScope(tx);
	const [mode] = await tx
		.insert(evaluationModes)
		.values({ name: `Modalità ${crypto.randomUUID().slice(0, 8)}` })
		.returning({ id: evaluationModes.id });
	return {
		...scope,
		evaluationModeId: mode.id,
		publicQuestion: await createQuestion(tx, scope.publicSections[0]),
		privateQuestion: await createQuestion(tx, scope.privateSection),
	};
}

function startExam(userId: string, s: Seeded) {
	return startQuiz(userId, {
		sectionId: s.sentinel,
		quizMode: "EXAM_SIMULATION",
		questionCount: 100,
		timeLimit: null,
		evaluationModeId: s.evaluationModeId,
	});
}

function revoke(tx: TestTx, userId: string, sectionId: string) {
	return tx
		.delete(sectionAccess)
		.where(
			and(eq(sectionAccess.userId, userId), eq(sectionAccess.sectionId, sectionId))
		);
}

describe("getQuiz on an exam simulation", () => {
	it("serves the private questions to the admin who started it", () =>
		withBoundRollback(async tx => {
			const s = await seed(tx);
			const { quizId } = await startExam(s.admin, s);

			const quiz = await getQuiz(s.admin, quizId);
			expect(quiz?.questions.map(q => q.id)).toContain(s.privateQuestion);
		}));

	it("refuses a student without access who opens the admin's quiz", () =>
		withBoundRollback(async tx => {
			const s = await seed(tx);
			const { quizId } = await startExam(s.admin, s);

			await expect(getQuiz(s.student, quizId)).rejects.toBeInstanceOf(Forbidden);
		}));

	it("serves a quiz of public questions to another student", () =>
		withBoundRollback(async tx => {
			const s = await seed(tx);
			const { quizId } = await startExam(s.student, s);
			const other = await createUser(tx, "STUDENT");

			const quiz = await getQuiz(other, quizId);
			expect(quiz?.questions.map(q => q.id)).toEqual([s.publicQuestion]);
		}));

	it("refuses to continue an attempt after the grant is revoked", () =>
		withBoundRollback(async tx => {
			const s = await seed(tx);
			await tx
				.insert(sectionAccess)
				.values({ userId: s.student, sectionId: s.privateSection });
			const { quizId } = await startExam(s.student, s);
			expect((await getQuiz(s.student, quizId))?.questions).toHaveLength(2);

			await revoke(tx, s.student, s.privateSection);

			await expect(getQuiz(s.student, quizId)).rejects.toBeInstanceOf(Forbidden);
		}));
});

describe("getQuizResults after the grant is revoked", () => {
	it("still returns the questions of the user's own completed attempt", () =>
		withBoundRollback(async tx => {
			const s = await seed(tx);
			await tx
				.insert(sectionAccess)
				.values({ userId: s.student, sectionId: s.privateSection });
			const { attemptId } = await startExam(s.student, s);
			await completeQuiz(s.student, {
				quizAttemptId: attemptId,
				answers: [],
				timeSpent: 0,
			});

			await revoke(tx, s.student, s.privateSection);

			const results = await getQuizResults(s.student, attemptId);
			expect(results?.quiz.questions.map(q => q.id)).toContain(s.privateQuestion);
		}));

	it("returns nothing for another user's attempt", () =>
		withBoundRollback(async tx => {
			const s = await seed(tx);
			const { attemptId } = await startExam(s.admin, s);
			await completeQuiz(s.admin, {
				quizAttemptId: attemptId,
				answers: [],
				timeSpent: 0,
			});

			expect(await getQuizResults(s.student, attemptId)).toBeNull();
		}));
});

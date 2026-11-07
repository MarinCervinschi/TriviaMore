import { and, eq } from "drizzle-orm";
import { afterAll, describe, expect, it, vi } from "vitest";

import { contentRequests, questions, sections } from "@/db/schema";
import type { AuthUser } from "@/lib/auth/types";
import { Forbidden, Invalid } from "@/lib/server/errors";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";
import { type MaintainerScope, seedMaintainerScope } from "@/lib/testing/fixtures";

import type { CreateRequestInput } from "./schemas";
import { approveRequest } from "./service/admin-requests";
import { createRequest } from "./service/user-requests";

const actor = vi.hoisted(() => ({ user: null as AuthUser | null }));

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/auth/guards", async importOriginal => ({
	...(await importOriginal<typeof import("@/lib/auth/guards")>()),
	requireAdmin: async () => actor.user!,
}));

vi.mock("@/lib/achievements/service", () => ({
	evaluateAchievementsInBackground: vi.fn(),
}));

afterAll(() => closeTestDb());

const CONTENT = "Domanda di prova";

const SUBMITTED = {
	type: "questions",
	questions: [
		{
			content: CONTENT,
			question_type: "SHORT_ANSWER",
			options: null,
			correct_answer: ["prova"],
			explanation: null,
			difficulty: "EASY",
		},
	],
};

function questionsRequest(
	target: Pick<CreateRequestInput, "target_class_id" | "target_section_id">
): CreateRequestInput {
	return { type: "questions", ...target, submitted_content: SUBMITTED };
}

function actAs(scope: MaintainerScope) {
	actor.user = {
		id: scope.maintainer,
		role: "MAINTAINER",
		email: "",
		name: null,
		image: null,
	};
}

function questionsIn(tx: TestTx, sectionId: string) {
	return tx
		.select({ id: questions.id })
		.from(questions)
		.where(and(eq(questions.sectionId, sectionId), eq(questions.content, CONTENT)));
}

describe("a MAINTAINER approving its own questions request", () => {
	it("places the questions in a public section of a class it maintains", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			const { id } = await createRequest(
				scope.maintainer,
				questionsRequest({ target_section_id: scope.publicSection })
			);
			await approveRequest(id);

			expect(await questionsIn(tx, scope.publicSection)).toHaveLength(1);
		}));

	it("cannot pair a class it maintains with a public section of another course", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			const attempt = async () => {
				const { id } = await createRequest(
					scope.maintainer,
					questionsRequest({
						target_class_id: scope.classInScope,
						target_section_id: scope.sectionOutOfScope,
					})
				);
				await approveRequest(id);
			};

			await expect(attempt()).rejects.toBeInstanceOf(Invalid);
			expect(await questionsIn(tx, scope.sectionOutOfScope)).toHaveLength(0);
		}));

	it("cannot approve a stored request whose section is outside its courses", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			const [request] = await tx
				.insert(contentRequests)
				.values({
					userId: scope.maintainer,
					requestType: "NEW_QUESTIONS",
					submittedContent: SUBMITTED,
					targetCourseId: scope.maintainedCourse,
					targetClassId: scope.classInScope,
					targetSectionId: scope.sectionOutOfScope,
				})
				.returning({ id: contentRequests.id });

			await expect(approveRequest(request.id)).rejects.toBeInstanceOf(Forbidden);
			expect(await questionsIn(tx, scope.sectionOutOfScope)).toHaveLength(0);
		}));

	it("cannot approve a request aimed only at a section outside its courses", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			const { id } = await createRequest(
				scope.maintainer,
				questionsRequest({ target_section_id: scope.sectionOutOfScope })
			);

			await expect(approveRequest(id)).rejects.toBeInstanceOf(Forbidden);
			expect(await questionsIn(tx, scope.sectionOutOfScope)).toHaveLength(0);
		}));

	it("cannot request or approve questions for a private section of a class it maintains", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			await expect(
				createRequest(
					scope.maintainer,
					questionsRequest({ target_section_id: scope.privateSection })
				)
			).rejects.toBeInstanceOf(Forbidden);

			const [request] = await tx
				.insert(contentRequests)
				.values({
					userId: scope.maintainer,
					requestType: "NEW_QUESTIONS",
					submittedContent: SUBMITTED,
					targetCourseId: scope.maintainedCourse,
					targetClassId: scope.classInScope,
					targetSectionId: scope.privateSection,
				})
				.returning({ id: contentRequests.id });

			await expect(approveRequest(request.id)).rejects.toBeInstanceOf(Forbidden);
			expect(await questionsIn(tx, scope.privateSection)).toHaveLength(0);
		}));
});

describe("a MAINTAINER approving its own section request", () => {
	const NAME = "Sezione proposta";

	function sectionRequest(classId: string): CreateRequestInput {
		return {
			type: "section",
			target_class_id: classId,
			submitted_content: { type: "section", name: NAME, description: "" },
		};
	}

	function sectionsIn(tx: TestTx, classId: string) {
		return tx
			.select({ id: sections.id })
			.from(sections)
			.where(and(eq(sections.classId, classId), eq(sections.name, NAME)));
	}

	it("adds the section to a class it maintains", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			const { id } = await createRequest(
				scope.maintainer,
				sectionRequest(scope.classInScope)
			);
			await approveRequest(id);

			expect(await sectionsIn(tx, scope.classInScope)).toHaveLength(1);
		}));

	it("cannot add a section to a class outside its courses", () =>
		withBoundRollback(async tx => {
			const scope = await seedMaintainerScope(tx);
			actAs(scope);

			const { id } = await createRequest(
				scope.maintainer,
				sectionRequest(scope.classOutOfScope)
			);

			await expect(approveRequest(id)).rejects.toBeInstanceOf(Forbidden);
			expect(await sectionsIn(tx, scope.classOutOfScope)).toHaveLength(0);
		}));
});

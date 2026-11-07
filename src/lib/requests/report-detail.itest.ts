import { afterAll, describe, expect, it, vi } from "vitest";

import { contentRequests } from "@/db/schema";
import type { AuthUser } from "@/lib/auth/types";
import { Forbidden } from "@/lib/server/errors";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";
import { createQuestion, seedSectionAccessScope } from "@/lib/testing/fixtures";

import type { CreateRequestInput } from "./schemas";
import { getRequestDetail } from "./service/admin-requests";
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

afterAll(() => closeTestDb());

function report(questionId: string) {
	return {
		type: "report",
		question_id: questionId,
		question_content: "x",
		reasons: ["errata"],
		comment: null,
	};
}

function reportRequest(questionId: string): CreateRequestInput {
	return { type: "report", submitted_content: report(questionId) };
}

// A report stored while its author could still open the section.
async function storedReport(
	tx: TestTx,
	userId: string,
	questionId: string,
	sectionId: string
) {
	const [row] = await tx
		.insert(contentRequests)
		.values({
			userId,
			requestType: "REPORT",
			submittedContent: report(questionId),
			targetSectionId: sectionId,
		})
		.returning({ id: contentRequests.id });
	return row.id;
}

describe("reporting a question", () => {
	it("is refused for a question in a private section the user cannot open", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateDenied);

			await expect(
				createRequest(s.student, reportRequest(question))
			).rejects.toBeInstanceOf(Forbidden);
		}));

	it("is refused for a MAINTAINER without a grant", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateDenied);

			await expect(
				createRequest(s.maintainer, reportRequest(question))
			).rejects.toBeInstanceOf(Forbidden);
		}));

	it("is accepted for a private section the user was granted", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateGranted);

			const { id } = await createRequest(s.student, reportRequest(question));
			const detail = await getRequestDetail(s.student, id);
			expect(detail.reportedQuestion?.id).toBe(question);
		}));
});

describe("the author reading a report's detail", () => {
	it("does not get the question once the section is out of reach", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateDenied);
			const id = await storedReport(tx, s.student, question, s.privateDenied);

			const detail = await getRequestDetail(s.student, id);
			expect(detail.reportedQuestion).toBeNull();
		}));

	it("gets the question of a public section", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.publicSection);

			const { id } = await createRequest(s.student, reportRequest(question));
			const detail = await getRequestDetail(s.student, id);
			expect(detail.reportedQuestion?.correctAnswer).toEqual(["A"]);
		}));
});

describe("an admin reading someone else's report", () => {
	it("gets the question of a private section", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateDenied);
			const id = await storedReport(tx, s.student, question, s.privateDenied);
			actor.user = { id: s.admin, role: "ADMIN", email: "", name: null, image: null };

			const detail = await getRequestDetail(s.admin, id);
			expect(detail.reportedQuestion?.id).toBe(question);
		}));
});

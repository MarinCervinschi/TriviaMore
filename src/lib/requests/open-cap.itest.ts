import { afterAll, describe, expect, it, vi } from "vitest";

import { contentRequests } from "@/db/schema";
import { Conflict, Invalid } from "@/lib/server/errors";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";
import { createQuestion, seedSectionAccessScope } from "@/lib/testing/fixtures";

import type { CreateRequestInput } from "./schemas";
import { MAX_OPEN_REQUESTS_PER_USER, createRequest } from "./service/user-requests";

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

afterAll(() => closeTestDb());

function reportRequest(
	questionId: string,
	comment: string | null = null
): CreateRequestInput {
	return {
		type: "report",
		submitted_content: {
			type: "report",
			question_id: questionId,
			question_content: "x",
			reasons: ["errata"],
			comment,
		},
	};
}

async function openRequests(tx: TestTx, userId: string, n: number) {
	await tx.insert(contentRequests).values(
		Array.from({ length: n }, (_, i) => ({
			userId,
			requestType: "NEW_SECTION" as const,
			status: i % 2 === 0 ? ("PENDING" as const) : ("NEEDS_REVISION" as const),
			submittedContent: { type: "section", name: `S${i}`, description: "" },
		}))
	);
}

describe("open requests per user", () => {
	it("accepts a request below the cap", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.publicSection);
			await openRequests(tx, s.student, MAX_OPEN_REQUESTS_PER_USER - 1);

			await expect(
				createRequest(s.student, reportRequest(question))
			).resolves.toHaveProperty("id");
		}));

	it("refuses a request once the user has the maximum open", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.publicSection);
			await openRequests(tx, s.student, MAX_OPEN_REQUESTS_PER_USER);

			await expect(
				createRequest(s.student, reportRequest(question))
			).rejects.toBeInstanceOf(Conflict);
		}));

	it("does not count handled requests", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.publicSection);
			await tx.insert(contentRequests).values(
				Array.from({ length: MAX_OPEN_REQUESTS_PER_USER }, () => ({
					userId: s.student,
					requestType: "NEW_SECTION" as const,
					status: "APPROVED" as const,
					submittedContent: { type: "section", name: "S", description: "" },
				}))
			);

			await expect(
				createRequest(s.student, reportRequest(question))
			).resolves.toHaveProperty("id");
		}));
});

describe("submission limits", () => {
	it("refuses an overlong comment with a message the user can read", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.publicSection);

			const attempt = createRequest(
				s.student,
				reportRequest(question, "x".repeat(1001))
			);
			await expect(attempt).rejects.toBeInstanceOf(Invalid);
			await expect(attempt).rejects.toThrow("Il commento supera i 1000 caratteri");
		}));
});

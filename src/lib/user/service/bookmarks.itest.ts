import { and, eq } from "drizzle-orm";
import { afterAll, describe, expect, it, vi } from "vitest";

import { bookmarks, sectionAccess, sections } from "@/db/schema";
import { Forbidden } from "@/lib/server/errors";
import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";
import { createQuestion, seedSectionAccessScope } from "@/lib/testing/fixtures";

import { getUserBookmarks, toggleBookmark } from "./bookmarks";

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

afterAll(() => closeTestDb());

async function listed(userId: string) {
	return (await getUserBookmarks(userId)).map(row => row.questionId);
}

function stored(tx: TestTx, userId: string, questionId: string) {
	return tx
		.select({ questionId: bookmarks.questionId })
		.from(bookmarks)
		.where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
}

describe("toggleBookmark", () => {
	it("refuses a question in a private section the user cannot open", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateDenied, "SHORT_ANSWER");

			for (const userId of [s.student, s.maintainer]) {
				await expect(toggleBookmark(userId, question)).rejects.toBeInstanceOf(
					Forbidden
				);
				expect(await stored(tx, userId, question)).toHaveLength(0);
			}
		}));

	it("adds and removes a bookmark in a section the user can open", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateGranted);

			expect(await toggleBookmark(s.student, question)).toEqual({ action: "added" });
			expect(await toggleBookmark(s.student, question)).toEqual({ action: "removed" });
		}));

	it("lets an admin bookmark a question in any private section", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateDenied);

			expect(await toggleBookmark(s.admin, question)).toEqual({ action: "added" });
			expect(await listed(s.admin)).toEqual([question]);
		}));
});

describe("getUserBookmarks", () => {
	it("hides a bookmark once the grant is revoked, and shows it again when restored", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.privateGranted);
			await toggleBookmark(s.student, question);
			expect(await listed(s.student)).toEqual([question]);

			await tx
				.delete(sectionAccess)
				.where(
					and(
						eq(sectionAccess.userId, s.student),
						eq(sectionAccess.sectionId, s.privateGranted)
					)
				);
			expect(await listed(s.student)).toEqual([]);
			expect(await stored(tx, s.student, question)).toHaveLength(1);

			await tx
				.insert(sectionAccess)
				.values({ userId: s.student, sectionId: s.privateGranted });
			expect(await listed(s.student)).toEqual([question]);
		}));

	it("hides a bookmark once its section is made private", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionAccessScope(tx);
			const question = await createQuestion(tx, s.publicSection);
			await toggleBookmark(s.student, question);

			await tx
				.update(sections)
				.set({ isPublic: false })
				.where(eq(sections.id, s.publicSection));

			expect(await listed(s.student)).toEqual([]);
		}));
});

import { afterAll, describe, expect, it, vi } from "vitest";

import { type TestTx, closeTestDb, withBoundRollback } from "@/lib/testing/db";
import {
	createQuestion,
	createSection,
	seedSectionCountScope,
} from "@/lib/testing/fixtures";

import {
	getBrowseOverview,
	getPlatformStats,
	listTopContributedClasses,
} from "./overview";

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

afterAll(() => closeTestDb());

async function addPrivateContent(tx: TestTx, classId: string) {
	const sectionId = await createSection(tx, classId, false);
	await createQuestion(tx, sectionId);
	await createQuestion(tx, sectionId, "SHORT_ANSWER");
}

describe("listTopContributedClasses", () => {
	it("counts only the public sections and their questions", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionCountScope(tx);
			for (let i = 0; i < 3; i++) await createQuestion(tx, s.publicSections[0]);
			await createQuestion(tx, s.privateSection);
			await createQuestion(tx, s.privateSection);

			const rows = await listTopContributedClasses(tx, 1000);
			expect(rows.find(row => row.id === s.classId)).toMatchObject({
				sectionCount: 2,
				questionCount: 3,
			});
		}));
});

describe("the public catalogue totals", () => {
	it("do not move when private content is added", () =>
		withBoundRollback(async tx => {
			const s = await seedSectionCountScope(tx);
			await createQuestion(tx, s.publicSections[0]);
			const statsBefore = await getPlatformStats();
			const splitBefore = (await getBrowseOverview()).questionsByType;

			await addPrivateContent(tx, s.classId);

			expect(await getPlatformStats()).toEqual(statsBefore);
			expect((await getBrowseOverview()).questionsByType).toEqual(splitBefore);
		}));
});

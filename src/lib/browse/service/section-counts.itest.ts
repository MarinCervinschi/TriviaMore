import { afterAll, describe, expect, it } from "vitest";

import { filterAccessibleSections } from "@/lib/auth/checks";
import { findSectionsInClass } from "@/lib/catalog/db/sections";
import { closeTestDb, withRollback } from "@/lib/testing/db";
import { seedSectionCountScope } from "@/lib/testing/fixtures";

import { countVisibleSectionsByClass } from "./shared";

afterAll(() => closeTestDb());

// What the class page itself lists: the same two steps `getClassWithSections`
// takes, so the invariant below compares the catalogue against the real page and
// not against a second copy of the rule.
async function sectionsOnThePage(
	tx: Parameters<Parameters<typeof withRollback>[0]>[0],
	classId: string,
	userId: string | null
) {
	const all = await findSectionsInClass(tx, classId);
	const allowed = await filterAccessibleSections(
		tx,
		userId,
		all.map(section => section.id)
	);
	return all.filter(section => allowed.has(section.id));
}

describe("countVisibleSectionsByClass", () => {
	it("returns an empty map for no classes", () =>
		withRollback(async tx => {
			expect(await countVisibleSectionsByClass(tx, [], null)).toEqual(new Map());
		}));

	it("leaves out the exam-simulation sentinel", () =>
		withRollback(async tx => {
			const scope = await seedSectionCountScope(tx);
			const counts = await countVisibleSectionsByClass(tx, [scope.classId], null);
			// Two public sections, and the sentinel is public too — so a count that
			// included it would read 3 here.
			expect(counts.get(scope.classId)).toBe(2);
		}));

	it("leaves out a private section the viewer cannot open", () =>
		withRollback(async tx => {
			const scope = await seedSectionCountScope(tx);
			const counts = await countVisibleSectionsByClass(
				tx,
				[scope.classId],
				scope.student
			);
			expect(counts.get(scope.classId)).toBe(2);
		}));

	it("counts the private section for an admin", () =>
		withRollback(async tx => {
			const scope = await seedSectionCountScope(tx);
			const counts = await countVisibleSectionsByClass(
				tx,
				[scope.classId],
				scope.admin
			);
			expect(counts.get(scope.classId)).toBe(3);
		}));

	it("omits a class with nothing visible rather than reporting zero", () =>
		withRollback(async tx => {
			const scope = await seedSectionCountScope(tx);
			const counts = await countVisibleSectionsByClass(tx, [crypto.randomUUID()], null);
			expect(counts.size).toBe(0);
			// The caller defaults a missing key to 0, which is what the list shows.
			expect(counts.get(scope.classId) ?? 0).toBe(0);
		}));

	// The bug this suite exists for: the figure beside a class in the catalogue
	// disagreed with the list the class page then showed.
	it("matches the number of sections the class page lists, for every viewer", () =>
		withRollback(async tx => {
			const scope = await seedSectionCountScope(tx);

			for (const userId of [null, scope.student, scope.admin]) {
				const counts = await countVisibleSectionsByClass(tx, [scope.classId], userId);
				const listed = await sectionsOnThePage(tx, scope.classId, userId);
				expect(counts.get(scope.classId) ?? 0).toBe(listed.length);
			}
		}));
});

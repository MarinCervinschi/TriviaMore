import { afterAll, describe, expect, it } from "vitest";

import { closeTestDb, withRollback } from "@/lib/testing/db";
import { seedSectionAccessScope } from "@/lib/testing/fixtures";

import {
	assertSectionAccess,
	canAccessSection,
	filterAccessibleSections,
} from "./checks";

afterAll(() => closeTestDb());

describe("canAccessSection", () => {
	it("allows anyone into a public section, signed in or not", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			expect(await canAccessSection(tx, null, scope.publicSection)).toBe(true);
			expect(await canAccessSection(tx, scope.student, scope.publicSection)).toBe(true);
		}));

	it("keeps an anonymous visitor out of a private section", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			expect(await canAccessSection(tx, null, scope.privateGranted)).toBe(false);
		}));

	it("lets a user into a private section they were granted", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			expect(await canAccessSection(tx, scope.student, scope.privateGranted)).toBe(
				true
			);
		}));

	it("keeps a user out of a private section they were not granted", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			expect(await canAccessSection(tx, scope.student, scope.privateDenied)).toBe(
				false
			);
		}));

	it("treats a grant as scoped to its own section", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			// The student is granted `privateGranted`; that must not leak to a sibling.
			expect(await canAccessSection(tx, scope.student, scope.privateDenied)).toBe(
				false
			);
		}));

	it("denies a section that does not exist", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			expect(await canAccessSection(tx, scope.student, crypto.randomUUID())).toBe(
				false
			);
		}));
});

describe("assertSectionAccess", () => {
	it("resolves for an accessible section", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			await expect(
				assertSectionAccess(tx, scope.student, scope.publicSection)
			).resolves.toBeUndefined();
		}));

	it("throws for an inaccessible section", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			await expect(
				assertSectionAccess(tx, scope.student, scope.privateDenied)
			).rejects.toThrow();
		}));
});

describe("filterAccessibleSections", () => {
	it("returns an empty set for no input without touching the database", () =>
		withRollback(async tx => {
			expect(await filterAccessibleSections(tx, crypto.randomUUID(), [])).toEqual(
				new Set()
			);
		}));

	it("keeps public and granted sections, drops the rest", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			const allowed = await filterAccessibleSections(tx, scope.student, [
				scope.publicSection,
				scope.privateGranted,
				scope.privateDenied,
			]);
			expect(allowed).toEqual(new Set([scope.publicSection, scope.privateGranted]));
		}));

	it("returns only public sections for an anonymous visitor", () =>
		withRollback(async tx => {
			const scope = await seedSectionAccessScope(tx);
			const allowed = await filterAccessibleSections(tx, null, [
				scope.publicSection,
				scope.privateGranted,
			]);
			expect(allowed).toEqual(new Set([scope.publicSection]));
		}));
});

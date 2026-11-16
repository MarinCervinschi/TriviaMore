import { desc, eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { classes, courses } from "@/db/schema";
import { type TestTx, closeTestDb, withRollback } from "@/lib/testing/db";
import { createDepartment } from "@/lib/testing/fixtures";

import { matchingClasses, matchingCourses, searchTerms } from "./search";

afterAll(() => closeTestDb());

const COURSES = [
	{ name: "Ingegneria Informatica", code: "20-262" },
	{ name: "Ingegneria Elettronica", code: "20-263" },
	{ name: "Informatica", code: "16-300" },
	{ name: "Università e società", code: "18-100" },
	{ name: "Lingue e culture europee", code: "MN1-1351" },
];

async function seedCourses(tx: TestTx) {
	const departmentId = await createDepartment(tx);
	await tx.insert(courses).values(COURSES.map(course => ({ ...course, departmentId })));
}

async function courseNames(tx: TestTx, text: string): Promise<string[]> {
	const matches = matchingCourses(tx, text);
	if (!matches) return [];
	const rows = await tx
		.select({ name: courses.name })
		.from(courses)
		.innerJoin(matches, eq(matches.id, courses.id))
		.orderBy(desc(matches.score), courses.name);
	return rows.map(row => row.name);
}

async function classNames(tx: TestTx, text: string): Promise<string[]> {
	const matches = matchingClasses(tx, text);
	if (!matches) return [];
	const rows = await tx
		.select({ name: classes.name })
		.from(classes)
		.innerJoin(matches, eq(matches.id, classes.id))
		.orderBy(desc(matches.score), classes.name);
	return rows.map(row => row.name);
}

describe("searchTerms", () => {
	it("drops punctuation and empty words", () => {
		expect(searchTerms(`  "analisi,  I' `)).toEqual(["analisi", "I"]);
		expect(searchTerms(" - ")).toEqual([]);
	});
});

describe("matchingCourses", () => {
	it("is null when the text has no terms", () =>
		withRollback(async tx => {
			expect(matchingCourses(tx, "  ?! ")).toBeNull();
		}));

	it("forgives a typo", () =>
		withRollback(async tx => {
			await seedCourses(tx);
			expect(await courseNames(tx, "informatca")).toEqual([
				"Informatica",
				"Ingegneria Informatica",
			]);
		}));

	it("ignores accents both ways", () =>
		withRollback(async tx => {
			await seedCourses(tx);
			expect(await courseNames(tx, "universita societa")).toEqual([
				"Università e società",
			]);
		}));

	it("matches the plural from the singular", () =>
		withRollback(async tx => {
			await seedCourses(tx);
			expect(await courseNames(tx, "lingua europea")).toEqual([
				"Lingue e culture europee",
			]);
		}));

	it("matches every term, the last one by prefix", () =>
		withRollback(async tx => {
			await seedCourses(tx);
			expect(await courseNames(tx, "ingegneria inform")).toEqual([
				"Ingegneria Informatica",
			]);
		}));

	it("finds a code exactly and by prefix, in any case", () =>
		withRollback(async tx => {
			await seedCourses(tx);
			expect(await courseNames(tx, "20-262")).toEqual(["Ingegneria Informatica"]);
			expect(await courseNames(tx, "20-26")).toEqual([
				"Ingegneria Elettronica",
				"Ingegneria Informatica",
			]);
			expect(await courseNames(tx, "mn1 - 13")).toEqual(["Lingue e culture europee"]);
		}));

	it("ranks the shorter exact name above a longer one", () =>
		withRollback(async tx => {
			await seedCourses(tx);
			expect(await courseNames(tx, "informatica")).toEqual([
				"Informatica",
				"Ingegneria Informatica",
			]);
		}));
});

describe("matchingClasses", () => {
	it("does not let a stem one edit from a short word match it", () =>
		withRollback(async tx => {
			await tx
				.insert(classes)
				.values([
					{ name: "Sistemi Operativi" },
					{ name: "Sistemi Manageriali per la Performance" },
				]);
			expect(await classNames(tx, "sistema operativo")).toEqual(["Sistemi Operativi"]);
		}));

	it("ranks an exact match above a typo and keeps the typo", () =>
		withRollback(async tx => {
			await tx
				.insert(classes)
				.values([
					{ name: "Analisi matematica" },
					{ name: "Anilisi dei dati" },
					{ name: "Fisica" },
				]);
			expect(await classNames(tx, "analisi")).toEqual([
				"Analisi matematica",
				"Anilisi dei dati",
			]);
		}));
});

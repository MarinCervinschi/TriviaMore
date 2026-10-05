import { describe, expect, it } from "vitest";

import { planCatalogueAdditions, toCatalogueTitle } from "@/lib/catalog/sync/additions";
import { type SourceActivity, pairKey } from "@/lib/catalog/sync/diff";
import type { SourceAttributes } from "@/lib/catalog/sync/plan";

function activity(over: Partial<SourceActivity> = {}): SourceActivity {
	return {
		academicYear: "2025",
		courseCode: "16-315",
		courseName: "INFORMATICA",
		codicione: null,
		code: "TIROC-1",
		name: "TIROCINIO",
		cfu: 12,
		classYear: 3,
		taf: "Altro",
		teachingPeriod: null,
		ssd: null,
		evaluation: null,
		curriculum: "A",
		group: "OO",
		catalogueUrl: null,
		...over,
	};
}

const COURSES = [
	{ id: "c1", code: "16-315", name: "Altro" },
	{ id: "c2", code: "20-312", name: "Altro" },
];

function attributes(
	code: string,
	evaluation: string,
	courseCode = "16-315"
): [string, SourceAttributes[]] {
	return [pairKey(courseCode, code), [{ academicYear: "2025", evaluation, ssd: null }]];
}

describe("toCatalogueTitle", () => {
	it("title-cases and keeps minor words lowercase", () => {
		expect(toCatalogueTitle("DIRITTO E POLITICHE DELLA SICUREZZA URBANA")).toBe(
			"Diritto e Politiche della Sicurezza Urbana"
		);
	});

	it("keeps roman numerals upper case", () => {
		expect(toCatalogueTitle("ANALISI MATEMATICA II")).toBe("Analisi Matematica II");
		expect(toCatalogueTitle("FONDAMENTI DI INFORMATICA I")).toBe(
			"Fondamenti di Informatica I"
		);
	});

	it("handles elisions, slashes and accents", () => {
		expect(toCatalogueTitle("ECONOMIA DELL'IMPRESA")).toBe("Economia dell'Impresa");
		expect(toCatalogueTitle("TIROCINIO/ATTIVITÀ PROGETTUALE")).toBe(
			"Tirocinio/Attività Progettuale"
		);
	});

	it("does not read the word «di» as a numeral", () => {
		expect(toCatalogueTitle("STORIA DI ROMA")).toBe("Storia di Roma");
	});
});

describe("planCatalogueAdditions", () => {
	it("adds a plan class our course lacks", () => {
		const plan = planCatalogueAdditions(
			{ courses: COURSES, courseClasses: [] },
			{
				activities: [activity()],
				mandatory: new Map([[pairKey("16-315", "TIROC-1"), [true]]]),
				attributes: new Map([attributes("TIROC-1", "Giudizio Finale")]),
			}
		);
		expect(plan.additions).toEqual([
			expect.objectContaining({
				courseId: "c1",
				code: "TIROC-1",
				classId: null,
				name: "Tirocinio",
				classYear: 3,
				mandatory: true,
				evaluation: "PASS_FAIL",
			}),
		]);
	});

	it("skips a class whose evaluation is unknown", () => {
		const plan = planCatalogueAdditions(
			{ courses: COURSES, courseClasses: [] },
			{ activities: [activity()], mandatory: new Map(), attributes: new Map() }
		);
		expect(plan.additions).toEqual([]);
		expect(plan.skipped.unknownEvaluation).toBe(1);
	});

	it("links the existing class when another course already holds the code", () => {
		const plan = planCatalogueAdditions(
			{
				courses: COURSES,
				courseClasses: [
					{
						courseId: "c2",
						classId: "k9",
						courseCode: "20-312",
						code: "TIROC-1",
						name: "Altro",
					},
				],
			},
			{
				activities: [activity()],
				mandatory: new Map(),
				attributes: new Map([attributes("TIROC-1", "Giudizio Finale")]),
			}
		);
		expect(plan.additions[0]!.classId).toBe("k9");
	});

	it("leaves a pair the course already holds, even under a spaced code", () => {
		const plan = planCatalogueAdditions(
			{
				courses: COURSES,
				courseClasses: [
					{
						courseId: "c1",
						classId: "k1",
						courseCode: "16-315",
						code: "MN1-1351",
						name: "Altro",
					},
				],
			},
			{
				activities: [activity({ code: "MN1-1351", name: "Altro" })],
				mandatory: new Map(),
				attributes: new Map([attributes("MN1-1351", "Voto Finale")]),
			}
		);
		expect(plan.additions).toEqual([]);
	});

	it("ignores a course we do not hold", () => {
		const plan = planCatalogueAdditions(
			{ courses: COURSES, courseClasses: [] },
			{
				activities: [activity({ courseCode: "99-999" })],
				mandatory: new Map(),
				attributes: new Map([attributes("TIROC-1", "Giudizio Finale", "99-999")]),
			}
		);
		expect(plan.additions).toEqual([]);
	});

	it("does not link a class this course already holds under another code", () => {
		const plan = planCatalogueAdditions(
			{
				courses: COURSES,
				courseClasses: [
					{
						courseId: "c1",
						classId: "k9",
						courseCode: "16-315",
						code: "OLD-1",
						name: "Altro",
					},
					{
						courseId: "c2",
						classId: "k9",
						courseCode: "20-312",
						code: "TIROC-1",
						name: "Altro",
					},
				],
			},
			{
				activities: [activity()],
				mandatory: new Map(),
				attributes: new Map([attributes("TIROC-1", "Giudizio Finale")]),
			}
		);
		expect(plan.additions).toEqual([]);
		expect(plan.skipped.alreadyLinked).toBe(1);
	});

	it("does not add a class this course already holds under the same name", () => {
		const plan = planCatalogueAdditions(
			{
				courses: COURSES,
				courseClasses: [
					{
						courseId: "c1",
						classId: "k9",
						courseCode: "16-315",
						code: "OLD-1",
						name: "Tirocinio",
					},
				],
			},
			{
				activities: [activity()],
				mandatory: new Map(),
				attributes: new Map([attributes("TIROC-1", "Giudizio Finale")]),
			}
		);
		expect(plan.additions).toEqual([]);
		expect(plan.skipped.alreadyLinked).toBe(1);
	});

	it("carries the catalogue page of the added class", () => {
		const plan = planCatalogueAdditions(
			{ courses: COURSES, courseClasses: [] },
			{
				activities: [activity({ catalogueUrl: "https://x/af/2026?ad=TIROC-1" })],
				mandatory: new Map(),
				attributes: new Map([attributes("TIROC-1", "Giudizio Finale")]),
			}
		);
		expect(plan.additions[0]!.catalogueUrl).toBe("https://x/af/2026?ad=TIROC-1");
	});
});

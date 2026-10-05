import { describe, expect, it } from "vitest";

import { type SourceActivity, pairKey } from "@/lib/catalog/sync/diff";
import {
	type LocalCourseClass,
	classifyTeaching,
	consensus,
	latest,
	mapEvaluation,
	planCatalogueUpdates,
} from "@/lib/catalog/sync/plan";

function activity(over: Partial<SourceActivity> = {}): SourceActivity {
	return {
		academicYear: "2025",
		courseCode: "16-315",
		courseName: "INFORMATICA",
		codicione: "0360106203100001",
		code: "I215-002",
		name: "FISICA",
		cfu: 6,
		classYear: 1,
		taf: "Base",
		teachingPeriod: "Primo Ciclo Semestrale",
		ssd: null,
		evaluation: null,
		curriculum: "A",
		...over,
	};
}

function courseClass(over: Partial<LocalCourseClass> = {}): LocalCourseClass {
	return {
		courseId: "c1",
		classId: "k1",
		courseCode: "16-315",
		code: "I215-002",
		name: "Fisica",
		evaluation: null,
		taf: null,
		teachingPeriod: null,
		isTeaching: true,
		...over,
	};
}

const EMPTY_LOCAL = { departments: [], courses: [], classes: [], courseClasses: [] };
const EMPTY_SOURCE = {
	departments: [],
	courses: [],
	activities: [],
	attributes: new Map(),
};

describe("mapEvaluation", () => {
	it("maps the three catalogue labels", () => {
		expect(mapEvaluation("Voto Finale")).toBe("GRADED");
		expect(mapEvaluation("Giudizio Finale")).toBe("PASS_FAIL");
		expect(mapEvaluation("Nessuno")).toBe("NONE");
	});

	it("leaves an unknown label unknown", () => {
		expect(mapEvaluation("Voto in trentesimi")).toBeNull();
		expect(mapEvaluation(null)).toBeNull();
	});
});

describe("consensus", () => {
	it("picks the value most observations agree on", () => {
		expect(consensus(["a", "b", "a"])).toEqual({ value: "a", contested: true });
	});

	it("is uncontested when every observation agrees", () => {
		expect(consensus(["a", "a"])).toEqual({ value: "a", contested: false });
	});

	it("ignores missing observations", () => {
		expect(consensus([null, "a", null])).toEqual({ value: "a", contested: false });
		expect(consensus([null, null])).toEqual({ value: null, contested: false });
	});
});

describe("latest", () => {
	it("takes the most recent year, not the most frequent value", () => {
		expect(
			latest([
				{ academicYear: "2022", value: "MAT/05" },
				{ academicYear: "2023", value: "MAT/05" },
				{ academicYear: "2024", value: "MAT/05" },
				{ academicYear: "2025", value: "MATH-03/A" },
			])
		).toEqual({ value: "MATH-03/A", contested: false });
	});

	it("skips a recent year that has no value", () => {
		expect(
			latest([
				{ academicYear: "2024", value: "MAT/05" },
				{ academicYear: "2026", value: null },
			]).value
		).toBe("MAT/05");
	});

	it("is contested only when the latest year itself disagrees", () => {
		expect(
			latest([
				{ academicYear: "2025", value: "A" },
				{ academicYear: "2025", value: "B" },
				{ academicYear: "2025", value: "A" },
			])
		).toEqual({ value: "A", contested: true });
	});
});

describe("planCatalogueUpdates", () => {
	it("fills the course-class fields from the plan and the attributes", () => {
		const k = pairKey("16-315", "I215-002");
		const plan = planCatalogueUpdates(
			{ ...EMPTY_LOCAL, courseClasses: [courseClass()] },
			{
				...EMPTY_SOURCE,
				activities: [activity()],
				attributes: new Map([
					[k, [{ academicYear: "2025", evaluation: "Voto Finale", ssd: "FIS/01" }]],
				]),
			}
		);
		expect(plan.courseClasses[0]!.set).toEqual({
			evaluation: "GRADED",
			taf: "Base",
			teachingPeriod: "Primo Ciclo Semestrale",
		});
	});

	it("matches a stored code against a source one written with spaces", () => {
		const plan = planCatalogueUpdates(
			{ ...EMPTY_LOCAL, courseClasses: [courseClass({ code: "MN1-1351" })] },
			{ ...EMPTY_SOURCE, activities: [activity({ code: "MN1-1351" })] }
		);
		expect(plan.courseClasses).toHaveLength(1);
		expect(plan.unmatched.courseClasses).toBe(0);
	});

	it("returns nothing on a second run", () => {
		const row = courseClass({
			evaluation: "GRADED",
			taf: "Base",
			teachingPeriod: "Primo Ciclo Semestrale",
		});
		const k = pairKey("16-315", "I215-002");
		const plan = planCatalogueUpdates(
			{ ...EMPTY_LOCAL, courseClasses: [row] },
			{
				...EMPTY_SOURCE,
				activities: [activity()],
				attributes: new Map([
					[k, [{ academicYear: "2025", evaluation: "Voto Finale", ssd: null }]],
				]),
			}
		);
		expect(plan.courseClasses).toEqual([]);
	});

	it("never erases a value the source leaves empty", () => {
		const plan = planCatalogueUpdates(
			{ ...EMPTY_LOCAL, courseClasses: [courseClass({ taf: "Base" })] },
			{ ...EMPTY_SOURCE, activities: [activity({ taf: null, teachingPeriod: null })] }
		);
		expect(plan.courseClasses).toEqual([]);
	});

	it("reads a class's SSD across every course it sits in", () => {
		const a = pairKey("16-315", "I215-002");
		const b = pairKey("20-312", "I215-002");
		const plan = planCatalogueUpdates(
			{
				...EMPTY_LOCAL,
				classes: [{ id: "k1", name: "Fisica", ssd: null }],
				courseClasses: [
					courseClass({ courseCode: "16-315" }),
					courseClass({ courseCode: "20-312", courseId: "c2" }),
				],
			},
			{
				...EMPTY_SOURCE,
				attributes: new Map([
					[a, [{ academicYear: "2025", evaluation: null, ssd: "FIS/01" }]],
					[b, [{ academicYear: "2025", evaluation: null, ssd: "FIS/01" }]],
				]),
			}
		);
		expect(plan.classes).toEqual([
			{ id: "k1", name: "Fisica", ssd: "FIS/01", contested: false },
		]);
	});

	it("matches departments ignoring case and doubled spaces", () => {
		const plan = planCatalogueUpdates(
			{
				...EMPTY_LOCAL,
				departments: [
					{
						id: "d1",
						name: "Dipartimento di Scienze Mediche e Chirurgiche",
						catalogueCode: null,
					},
				],
			},
			{
				...EMPTY_SOURCE,
				departments: [
					{ code: "302", name: "Dipartimento di Scienze Mediche e  Chirurgiche" },
				],
			}
		);
		expect(plan.departments).toEqual([
			{
				id: "d1",
				name: "Dipartimento di Scienze Mediche e Chirurgiche",
				catalogueCode: "302",
			},
		]);
	});

	it("counts what the source says nothing about, without failing on it", () => {
		const plan = planCatalogueUpdates(
			{ ...EMPTY_LOCAL, courseClasses: [courseClass({ code: "GONE" })] },
			EMPTY_SOURCE
		);
		expect(plan.unmatched.courseClasses).toBe(1);
		expect(plan.courseClasses).toEqual([]);
	});
});

describe("classifyTeaching", () => {
	it.each([
		"Prova Finale",
		"Tirocinio 3 Anno",
		"Tirocinio/Attività Progettuale",
		"Traineeship",
		"Final Examination",
		"Tesi",
		"Ofa - Obblighi Formativi Aggiuntivi",
		"Verifica Preparazione Iniziale",
		"Ulteriori Conoscenze Linguistiche",
		"Ulteriori Attività Formative (Art. 10)",
		"Materie a Scelta - Art. 10, C. 5, L. A)",
	])("reads %s as a plan activity, graded or not", name => {
		expect(classifyTeaching(name, "GRADED")).toBe(false);
	});

	it.each([
		"Analisi Matematica I",
		"Inglese Avanzato",
		"Protesi Dentaria II",
		"Stagecraft",
	])("reads %s as a class", name => {
		expect(classifyTeaching(name, "GRADED")).toBe(true);
	});

	it("reads an ungraded class as not a teaching", () => {
		expect(classifyTeaching("Lingua Inglese", "PASS_FAIL")).toBe(false);
	});

	it("leaves a class unclassified when its evaluation is unknown", () => {
		expect(classifyTeaching("Diritto Processuale Civile", null)).toBeNull();
	});
});

describe("planCatalogueUpdates — classification", () => {
	it("classifies an unclassified row from its evaluation", () => {
		const k = pairKey("16-315", "I215-002");
		const plan = planCatalogueUpdates(
			{ ...EMPTY_LOCAL, courseClasses: [courseClass({ isTeaching: null })] },
			{
				...EMPTY_SOURCE,
				attributes: new Map([
					[k, [{ academicYear: "2025", evaluation: "Giudizio Finale", ssd: null }]],
				]),
			}
		);
		expect(plan.courseClasses[0]!.set).toMatchObject({ isTeaching: false });
	});

	it("classifies by name a row the source says nothing about", () => {
		const plan = planCatalogueUpdates(
			{
				...EMPTY_LOCAL,
				courseClasses: [
					courseClass({ code: "GONE", name: "Prova Finale", isTeaching: null }),
				],
			},
			EMPTY_SOURCE
		);
		expect(plan.courseClasses[0]!.set).toEqual({ isTeaching: false });
	});

	it("never overwrites a classification already made", () => {
		const k = pairKey("16-315", "I215-002");
		const plan = planCatalogueUpdates(
			{
				...EMPTY_LOCAL,
				courseClasses: [courseClass({ evaluation: "PASS_FAIL", isTeaching: true })],
			},
			{
				...EMPTY_SOURCE,
				attributes: new Map([
					[k, [{ academicYear: "2025", evaluation: "Giudizio Finale", ssd: null }]],
				]),
			}
		);
		expect(plan.courseClasses).toEqual([]);
	});
});

import { describe, expect, it } from "vitest";

import {
	type SourceCohort,
	type StoredCurriculum,
	type StoredPlanRow,
	planCohortPlans,
} from "@/lib/catalog/sync/cohort-plans";
import { type SourceActivity, pairKey } from "@/lib/catalog/sync/diff";
import type { SourceAttributes } from "@/lib/catalog/sync/plan";

function activity(over: Partial<SourceActivity> = {}): SourceActivity {
	return {
		academicYear: "2023",
		courseCode: "16-315",
		courseName: "INFORMATICA",
		codicione: "N1",
		code: "A1",
		name: "ANALISI MATEMATICA",
		cfu: 9,
		classYear: 1,
		taf: "Base",
		teachingPeriod: "Primo Semestre",
		ssd: null,
		evaluation: null,
		curriculum: "16-315-1",
		group: "OO",
		groupLabel: "Obbligatori",
		groupPosition: 0,
		catalogueUrl: null,
		syllabusRef: null,
		...over,
	};
}

function cohort(
	year: number,
	activities: SourceActivity[],
	over: Partial<SourceCohort> = {}
): SourceCohort {
	return {
		cohort: year,
		courses: [{ code: "16-315", codicione: "N1", name: "INFORMATICA" }],
		activities,
		curricula: [
			{
				courseCode: "16-315",
				code: "16-315-1",
				labels: ["Curriculum Sistemi e programmazione APPROVATO"],
				common: false,
			},
			{
				courseCode: "16-315",
				code: "16-315-2",
				labels: ["Curriculum applicativo APPROVATO"],
				common: false,
			},
		],
		...over,
	};
}

const LOCAL = {
	courses: [{ id: "c1", nationalCode: "N1" }],
	courseClasses: [
		{ courseId: "c1", classId: "k1", code: "a1", name: "Analisi Matematica" },
	],
	curricula: [] as StoredCurriculum[],
	plans: [] as StoredPlanRow[],
};

const NO_ATTRIBUTES = new Map<string, SourceAttributes[]>();

function storedCurriculum(over: Partial<StoredCurriculum> = {}): StoredCurriculum {
	return {
		id: "u1",
		courseId: "c1",
		cohort: 2023,
		code: "16-315-1",
		name: "Sistemi e programmazione",
		common: false,
		...over,
	};
}

function stored(over: Partial<StoredPlanRow> = {}): StoredPlanRow {
	return {
		id: "p1",
		courseId: "c1",
		cohort: 2023,
		curriculum: "16-315-1",
		code: "A1",
		classId: "k1",
		name: "Analisi Matematica",
		cfu: 9,
		classYear: 1,
		mandatory: true,
		groupCode: "OO",
		groupLabel: "Obbligatori",
		groupPosition: 0,
		evaluation: null,
		taf: "Base",
		teachingPeriod: "Primo Semestre",
		...over,
	};
}

describe("planCohortPlans", () => {
	it("inserts one row per cohort, linked to our class by its code", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [cohort(2023, [activity()]), cohort(2024, [activity()])],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts.map(r => [r.cohort, r.classId, r.mandatory])).toEqual([
			[2023, "k1", true],
			[2024, "k1", true],
		]);
	});

	it("keeps one row per curriculum, each with its own compulsory flag", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [
				cohort(2023, [
					activity({ curriculum: "16-315-1", group: "OO" }),
					activity({ curriculum: "16-315-2", group: "F" }),
				]),
			],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts.map(r => [r.curriculum, r.mandatory])).toEqual([
			["16-315-1", true],
			["16-315-2", false],
		]);
	});

	it("names the curricula that have rows, and skips the others", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [cohort(2023, [activity()])],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.curricula.inserts).toEqual([
			{
				courseId: "c1",
				cohort: 2023,
				code: "16-315-1",
				name: "Sistemi e programmazione",
				common: false,
			},
		]);
	});

	it("keeps a stored name, and gives it to the same curriculum of a new cohort", () => {
		const changes = planCohortPlans(
			{ ...LOCAL, curricula: [storedCurriculum({ name: "Sistemi" })] },
			{
				cohorts: [cohort(2023, [activity()]), cohort(2024, [activity()])],
				attributes: NO_ATTRIBUTES,
			}
		);
		expect(changes.curricula.updates).toEqual([]);
		expect(changes.curricula.inserts.map(c => [c.cohort, c.name])).toEqual([
			[2024, "Sistemi"],
		]);
	});

	it("collapses the schemas of one curriculum into one row", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [cohort(2023, [activity(), activity(), activity({ cfu: 6 })])],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts).toHaveLength(1);
		expect(changes.plans.inserts[0]!.cfu).toBe(9);
	});

	it("matches the course by its national code, whatever the year's code", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [
				cohort(2021, [activity({ courseCode: "99-001" })], {
					courses: [{ code: "99-001", codicione: "N1", name: "INFORMATICA" }],
				}),
			],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts.map(r => r.courseId)).toEqual(["c1"]);
	});

	it("counts a course we do not have and skips its rows", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [
				cohort(2023, [activity({ courseCode: "20-312" })], {
					courses: [{ code: "20-312", codicione: "N2", name: "INGEGNERIA" }],
				}),
			],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts).toEqual([]);
		expect(changes.unmatchedCourses).toBe(1);
	});

	it("leaves the class null when we have none for the code", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [cohort(2023, [activity({ code: "OLD", name: "FISICA" })])],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts[0]!.classId).toBeNull();
	});

	it("falls back to the name within the course", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [cohort(2023, [activity({ code: "RENAMED" })])],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts[0]!.classId).toBe("k1");
	});

	it("keeps each row's choice group", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [
				cohort(2023, [
					activity({
						group: "F",
						groupLabel: "Livello inglese B2 3cfu + tirocinio 9cfu",
						groupPosition: 2,
					}),
				]),
			],
			attributes: NO_ATTRIBUTES,
		});
		expect(changes.plans.inserts[0]).toMatchObject({
			mandatory: false,
			groupCode: "F",
			groupLabel: "Livello inglese B2 3cfu + tirocinio 9cfu",
			groupPosition: 2,
		});
	});

	it("does not fall back to a name two of the course's classes share", () => {
		const changes = planCohortPlans(
			{
				...LOCAL,
				courseClasses: [
					...LOCAL.courseClasses,
					{ courseId: "c1", classId: "k2", code: "a2", name: "Analisi Matematica" },
				],
			},
			{
				cohorts: [cohort(2023, [activity({ code: "RENAMED" })])],
				attributes: NO_ATTRIBUTES,
			}
		);
		expect(changes.plans.inserts[0]!.classId).toBeNull();
	});

	it("takes the evaluation from the latest year, under any of the course's codes", () => {
		const changes = planCohortPlans(LOCAL, {
			cohorts: [
				cohort(2022, [activity({ courseCode: "99-001" })], {
					courses: [{ code: "99-001", codicione: "N1", name: "INFORMATICA" }],
				}),
				cohort(2023, [activity()]),
			],
			attributes: new Map([
				[
					pairKey("99-001", "A1"),
					[{ academicYear: "2022", evaluation: "Giudizio Finale", ssd: null }],
				],
				[
					pairKey("16-315", "A1"),
					[{ academicYear: "2024", evaluation: "Voto Finale", ssd: null }],
				],
			]),
		});
		expect(changes.plans.inserts.map(r => r.evaluation)).toEqual(["GRADED", "GRADED"]);
	});

	it("updates only the fields that changed", () => {
		const changes = planCohortPlans(
			{ ...LOCAL, curricula: [storedCurriculum()], plans: [stored({ cfu: 6 })] },
			{ cohorts: [cohort(2023, [activity()])], attributes: NO_ATTRIBUTES }
		);
		expect(changes.plans.inserts).toEqual([]);
		expect(changes.plans.updates).toMatchObject([
			{ id: "p1", set: { cfu: 9 }, before: { cfu: 6 }, row: { cfu: 9 } },
		]);
	});

	it("is empty when the stored rows match", () => {
		const changes = planCohortPlans(
			{ ...LOCAL, curricula: [storedCurriculum()], plans: [stored()] },
			{ cohorts: [cohort(2023, [activity()])], attributes: NO_ATTRIBUTES }
		);
		const none = { inserts: [], updates: [], deletes: [], deleted: [] };
		expect(changes).toEqual({ curricula: none, plans: none, unmatchedCourses: 0 });
	});

	it("deletes a row the plan dropped, but not one of a cohort the source left out", () => {
		const changes = planCohortPlans(
			{
				...LOCAL,
				curricula: [storedCurriculum(), storedCurriculum({ id: "u0", cohort: 2021 })],
				plans: [
					stored(),
					stored({ id: "dropped", code: "GONE" }),
					stored({ id: "other-cohort", cohort: 2021 }),
				],
			},
			{ cohorts: [cohort(2023, [activity()])], attributes: NO_ATTRIBUTES }
		);
		expect(changes.plans.deletes).toEqual(["dropped"]);
		expect(changes.plans.deleted).toHaveLength(1);
		expect(changes.curricula.deletes).toEqual([]);
	});

	it("deletes a dropped curriculum, which takes its rows with it", () => {
		const changes = planCohortPlans(
			{
				...LOCAL,
				curricula: [
					storedCurriculum(),
					storedCurriculum({ id: "u2", code: "16-315-2" }),
				],
				plans: [stored(), stored({ id: "p2", curriculum: "16-315-2" })],
			},
			{ cohorts: [cohort(2023, [activity()])], attributes: NO_ATTRIBUTES }
		);
		expect(changes.curricula.deletes).toEqual(["u2"]);
		expect(changes.plans.deletes).toEqual([]);
	});
});

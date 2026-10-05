import { describe, expect, it } from "vitest";

import {
	type PlanViewCurriculum,
	type PlanViewRow,
	buildPlanView,
	inCurriculum,
	isMandatory,
	pickCohort,
} from "@/lib/browse/plan-view";

function row(over: Partial<PlanViewRow> = {}): PlanViewRow {
	return {
		code: "A1",
		name: "Analisi Matematica",
		cfu: 9,
		classYear: 1,
		mandatory: true,
		evaluation: "GRADED",
		curriculum: "C1",
		classId: "k1",
		link: "a1",
		description: null,
		isTeaching: true,
		hasContent: false,
		position: 0,
		...over,
	};
}

const CURRICULA: PlanViewCurriculum[] = [
	{ code: "C1", name: "Applications", common: false },
	{ code: "C2", name: "Large Scale", common: false },
	{ code: "PDS0", name: "Percorso comune", common: true },
];

describe("pickCohort", () => {
	const cohorts = [2021, 2022, 2023, 2024, 2025, 2026];

	it("prefers the requested cohort, then the student's, then the current one", () => {
		expect(
			pickCohort(cohorts, { requested: 2022, enrolled: 2024, current: 2026 })
		).toBe(2022);
		expect(pickCohort(cohorts, { enrolled: 2024, current: 2026 })).toBe(2024);
		expect(pickCohort(cohorts, { current: 2026 })).toBe(2026);
	});

	it("ignores a cohort the course does not have", () => {
		expect(
			pickCohort(cohorts, { requested: 1999, enrolled: 2030, current: 2026 })
		).toBe(2026);
	});

	it("falls back to the latest cohort before the current year", () => {
		expect(pickCohort([2021, 2023, 2028], { current: 2026 })).toBe(2023);
		expect(pickCohort([2028], { current: 2026 })).toBe(2028);
		expect(pickCohort([], { current: 2026 })).toBeNull();
	});
});

describe("buildPlanView", () => {
	it("merges a class listed by several curricula into one entry", () => {
		const view = buildPlanView(
			[
				row({ curriculum: "C1", mandatory: true }),
				row({ curriculum: "C2", mandatory: false }),
			],
			CURRICULA,
			new Map([["k1", 3]])
		);
		expect(view.classes).toHaveLength(1);
		expect(view.classes[0]!.curricula).toEqual([
			{ code: "C1", mandatory: true },
			{ code: "C2", mandatory: false },
		]);
		expect(view.classes[0]!.sectionCount).toBe(3);
	});

	it("leaves out the common trunk when the course has curricula proper", () => {
		const view = buildPlanView(
			[row({ curriculum: "PDS0", code: "T1" }), row()],
			CURRICULA,
			new Map()
		);
		expect(view.classes.map(c => c.code)).toEqual(["A1"]);
		expect(view.curricula.map(c => c.code)).toEqual(["C1", "C2"]);
	});

	it("keeps the common trunk when it is the only path", () => {
		const view = buildPlanView(
			[row({ curriculum: "PDS0" })],
			[{ code: "PDS0", name: "Percorso comune", common: true }],
			new Map()
		);
		expect(view.classes).toHaveLength(1);
	});

	it("lists a plan activity apart, unless it has content", () => {
		const view = buildPlanView(
			[
				row({ code: "T1", name: "Tirocinio", isTeaching: false }),
				row({ code: "T2", name: "Tirocinio II", isTeaching: false, hasContent: true }),
			],
			CURRICULA,
			new Map()
		);
		expect(view.activities.map(a => a.id)).toEqual(["T1"]);
		expect(view.classes.map(c => c.id)).toEqual(["T2"]);
	});

	it("classifies a class we do not hold from its name and evaluation", () => {
		const view = buildPlanView(
			[
				row({
					code: "X1",
					classId: null,
					link: null,
					isTeaching: null,
					name: "Prova Finale",
					evaluation: "GRADED",
				}),
				row({
					code: "X2",
					classId: null,
					link: null,
					isTeaching: null,
					name: "Fisica",
				}),
			],
			CURRICULA,
			new Map()
		);
		expect(view.activities.map(a => a.id)).toEqual(["X1"]);
		expect(view.classes.map(c => [c.id, c.link, c.sectionCount])).toEqual([
			["X2", null, 0],
		]);
	});

	it("orders by year, then by our position", () => {
		const view = buildPlanView(
			[
				row({ code: "B", classYear: 2, position: 0 }),
				row({ code: "C", classYear: 1, position: null }),
				row({ code: "A", classYear: 1, position: 1 }),
			],
			CURRICULA,
			new Map()
		);
		expect(view.classes.map(c => c.code)).toEqual(["A", "C", "B"]);
	});
});

describe("isMandatory", () => {
	const entry = buildPlanView(
		[
			row({ curriculum: "C1", mandatory: true }),
			row({ curriculum: "C2", mandatory: false }),
		],
		CURRICULA,
		new Map()
	).classes[0]!;

	it("reads the chosen curriculum", () => {
		expect(isMandatory(entry, "C1")).toBe(true);
		expect(isMandatory(entry, "C2")).toBe(false);
	});

	it("needs every curriculum when none is chosen", () => {
		expect(isMandatory(entry)).toBe(false);
	});

	it("matches the curriculum filter", () => {
		expect(inCurriculum(entry, "C2")).toBe(true);
		expect(inCurriculum(entry, "C3")).toBe(false);
		expect(inCurriculum(entry)).toBe(true);
	});
});

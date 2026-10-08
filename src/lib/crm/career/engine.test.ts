import { describe, expect, it } from "vitest";

import {
	type CareerExam,
	DEFAULT_RULES,
	arithmeticAverage,
	earnedCfu,
	finalGrade,
	graduationBase,
	requiredAverage,
	weightedAverage,
	whatIf,
} from "./engine";

const passed = (cfu: number, grade: number, honours = false): CareerExam => ({
	cfu,
	status: "PASSED",
	graded: true,
	grade,
	honours,
});

const passFail = (cfu: number): CareerExam => ({
	cfu,
	status: "PASSED",
	graded: false,
	grade: null,
	honours: false,
});

const planned = (cfu: number): CareerExam => ({
	cfu,
	status: "PLANNED",
	graded: true,
	grade: null,
	honours: false,
});

describe("averages", () => {
	it("weights by CFU", () => {
		// (30·6 + 24·12) / 18 = 26
		expect(weightedAverage([passed(6, 30), passed(12, 24)])).toBe(26);
		expect(arithmeticAverage([passed(6, 30), passed(12, 24)])).toBe(27);
	});

	it("leaves out pass/fail, planned and rejected exams", () => {
		const exams: CareerExam[] = [
			passed(6, 28),
			passFail(3),
			planned(9),
			{ ...passed(6, 18), status: "REJECTED" },
		];
		expect(weightedAverage(exams)).toBe(28);
		expect(arithmeticAverage(exams)).toBe(28);
	});

	it("is null before the first graded exam", () => {
		expect(weightedAverage([passFail(3), planned(6)])).toBeNull();
		expect(graduationBase([passFail(3)])).toBeNull();
	});

	it("counts honours at the value the rules give it", () => {
		const exams = [passed(6, 30, true), passed(6, 24)];
		expect(weightedAverage(exams)).toBe(27);
		expect(weightedAverage(exams, { ...DEFAULT_RULES, honoursGrade: 33 })).toBe(28.5);
	});
});

describe("earnedCfu", () => {
	it("counts every passed activity, graded or not", () => {
		expect(earnedCfu([passed(6, 25), passFail(3), planned(9)])).toBe(9);
	});
});

describe("graduationBase", () => {
	it("is the average times 110 over 30", () => {
		// 27 · 110 / 30 = 99
		expect(graduationBase([passed(6, 27)])).toBe(99);
	});

	it("adds the honours points the rules grant, up to their cap", () => {
		const rules = { ...DEFAULT_RULES, honoursBonus: 0.5, honoursBonusCap: 1 };
		const exams = [passed(6, 30, true), passed(6, 30, true), passed(6, 30, true)];
		// 30 · 110 / 30 = 110, plus min(3 · 0.5, 1)
		expect(graduationBase(exams, rules)).toBe(111);
		expect(graduationBase(exams)).toBe(110);
	});
});

describe("finalGrade", () => {
	it("adds the committee's points, caps at the scale and rounds", () => {
		expect(finalGrade(99, { thesis: 4, inCorso: 2, erasmus: 0, other: 0 })).toEqual({
			raw: 105,
			rounded: 105,
		});
		expect(finalGrade(104.6).rounded).toBe(105);
		expect(finalGrade(108, { thesis: 5, inCorso: 0, erasmus: 0, other: 0 })).toEqual({
			raw: 110,
			rounded: 110,
		});
	});
});

describe("requiredAverage", () => {
	const exams = [passed(60, 24)];

	it("finds the average the remaining CFU need", () => {
		// 105 → overall 28.636…; (28.636… · 120 − 24 · 60) / 60 = 33.27: out of reach
		expect(requiredAverage({ exams, remainingGradedCfu: 60, target: 105 }).status).toBe(
			"impossible"
		);
		// 99 → overall 27; (27 · 120 − 1440) / 60 = 30
		expect(requiredAverage({ exams, remainingGradedCfu: 60, target: 99 })).toEqual({
			status: "possible",
			average: 30,
		});
	});

	it("counts the committee's points towards the target", () => {
		// 99 with 6 points → base 93 → overall 25.36…; needed 26.73
		const result = requiredAverage({
			exams,
			remainingGradedCfu: 60,
			target: 99,
			bonuses: { thesis: 6, inCorso: 0, erasmus: 0, other: 0 },
		});
		expect(result.status).toBe("possible");
		expect(result.status === "possible" && result.average).toBeCloseTo(26.727, 2);
	});

	it("is reached when a pass on what remains is enough", () => {
		expect(
			requiredAverage({ exams: [passed(150, 29)], remainingGradedCfu: 30, target: 90 })
		).toEqual({
			status: "reached",
		});
	});

	it("answers from the current grade once nothing remains", () => {
		expect(requiredAverage({ exams, remainingGradedCfu: 0, target: 88 }).status).toBe(
			"reached"
		);
		expect(requiredAverage({ exams, remainingGradedCfu: 0, target: 100 }).status).toBe(
			"impossible"
		);
	});
});

describe("whatIf", () => {
	it("compares the summary before and after one change", () => {
		const exams = [passed(6, 27), passed(6, 27)];
		const { before, after } = whatIf(exams, 1, { grade: 24 });
		expect(before.weightedAverage).toBe(27);
		expect(after.weightedAverage).toBe(25.5);
		expect(after.base).toBe(93.5);
	});

	it("can turn a planned exam into a passed one", () => {
		const { after } = whatIf([passed(6, 30), planned(6)], 1, {
			status: "PASSED",
			grade: 18,
		});
		expect(after.weightedAverage).toBe(24);
		expect(after.earnedCfu).toBe(12);
	});
});

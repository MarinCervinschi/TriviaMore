import { describe, expect, it } from "vitest";

import type { QuizMode } from "@/lib/quiz/types";

import {
	type Split,
	type Totals,
	buildMetricKpis,
	buildMetricWindow,
	buildQualityRows,
	metricPoint,
	metricValue,
	pickTotals,
	qualityDomain,
} from "./metric-explorer";
import type { DailyStudyStat } from "./types";

const TODAY = new Date("2026-04-18T12:00:00Z");

function stat(date: string, quizMode: QuizMode, o: Partial<Totals>): DailyStudyStat {
	return {
		date,
		quizMode,
		quizzes: o.quizzes ?? 0,
		gradeSum: o.gradeSum ?? 0,
		timeSpent: o.timeSpent ?? 0,
		answersTotal: o.answersTotal ?? 0,
		answersCorrect: o.answersCorrect ?? 0,
	};
}

describe("buildMetricWindow", () => {
	it("uses the right bucket count per period", () => {
		expect(buildMetricWindow([], "week", TODAY).buckets).toHaveLength(7);
		expect(buildMetricWindow([], "month", TODAY).buckets).toHaveLength(4);
		expect(buildMetricWindow([], "year", TODAY).buckets).toHaveLength(12);
	});

	it("keeps the two modes apart in the same bucket", () => {
		const daily = [
			stat("2026-04-18", "STUDY", { quizzes: 2, answersTotal: 20, answersCorrect: 16 }),
			stat("2026-04-18", "EXAM_SIMULATION", { quizzes: 1 }),
		];
		const { buckets } = buildMetricWindow(daily, "week", TODAY);
		const today = buckets.at(-1)!;
		expect(today.studio.quizzes).toBe(2);
		expect(today.esame.quizzes).toBe(1);
	});

	it("routes a stat just before the window into the previous total", () => {
		// week window is 04-12…04-18; the previous week is 04-05…04-11.
		const { buckets, previous } = buildMetricWindow(
			[stat("2026-04-08", "STUDY", { quizzes: 3 })],
			"week",
			TODAY
		);
		expect(buckets.every(b => b.studio.quizzes === 0)).toBe(true);
		expect(previous.studio.quizzes).toBe(3);
	});

	it("spans all calendar months of the data for the all period", () => {
		const daily = [
			stat("2026-02-10", "STUDY", { quizzes: 1 }),
			stat("2026-04-18", "STUDY", { quizzes: 1 }),
		];
		const { buckets } = buildMetricWindow(daily, "all", TODAY);
		expect(buckets).toHaveLength(3);
		expect(buckets[0]!.studio.quizzes).toBe(1);
		expect(buckets[2]!.studio.quizzes).toBe(1);
	});
});

describe("metricValue", () => {
	it("reads each metric, weighting grade and accuracy", () => {
		const t: Totals = {
			quizzes: 2,
			gradeSum: 50,
			timeSpent: 600_000,
			answersTotal: 20,
			answersCorrect: 15,
		};
		expect(metricValue(t, "quizzes")).toBe(2);
		expect(metricValue(t, "grade")).toBe(25);
		expect(metricValue(t, "accuracy")).toBe(75);
		expect(metricValue(t, "time")).toBe(600_000);
	});
});

describe("pickTotals", () => {
	it("reads one side or combines both", () => {
		const split: Split = {
			studio: {
				quizzes: 2,
				gradeSum: 0,
				timeSpent: 0,
				answersTotal: 0,
				answersCorrect: 0,
			},
			esame: {
				quizzes: 1,
				gradeSum: 0,
				timeSpent: 0,
				answersTotal: 0,
				answersCorrect: 0,
			},
		};
		expect(pickTotals(split, "STUDY").quizzes).toBe(2);
		expect(pickTotals(split, "EXAM_SIMULATION").quizzes).toBe(1);
		expect(pickTotals(split, "both").quizzes).toBe(3);
	});
});

describe("metricPoint", () => {
	const empty: Totals = {
		quizzes: 0,
		gradeSum: 0,
		timeSpent: 0,
		answersTotal: 0,
		answersCorrect: 0,
	};

	it("is null for a ratio with nothing to average, not zero", () => {
		expect(metricPoint(empty, "grade")).toBeNull();
		expect(metricPoint(empty, "accuracy")).toBeNull();
	});

	it("is zero for a sum, which is the real value of an empty period", () => {
		expect(metricPoint(empty, "quizzes")).toBe(0);
		expect(metricPoint(empty, "time")).toBe(0);
	});
});

describe("buildQualityRows", () => {
	// 04-14 and 04-18, so 04-15…04-17 is a gap inside the week window.
	const daily = [
		stat("2026-04-14", "STUDY", { quizzes: 1, gradeSum: 30 }),
		stat("2026-04-18", "STUDY", { quizzes: 1, gradeSum: 20 }),
	];

	it("keeps one row per day with data, plus a closing row at the window end", () => {
		const { range } = buildMetricWindow(daily, "week", TODAY);
		const rows = buildQualityRows(daily, "grade", "STUDY", range);
		// 04-18 *is* the window end, so no extra closing row is added.
		expect(rows.map(r => r.value)).toEqual([30, 20]);
	});

	it("carries the running average, which does not move across a gap", () => {
		const { range } = buildMetricWindow(daily, "week", TODAY);
		const rows = buildQualityRows(daily, "grade", "STUDY", range);
		expect(rows.map(r => r.valueCum)).toEqual([30, 25]);
	});

	it("leaves a side's dot absent on a day it did not study", () => {
		const mixed = [
			stat("2026-04-14", "STUDY", { quizzes: 1, gradeSum: 30 }),
			stat("2026-04-18", "EXAM_SIMULATION", { quizzes: 1, gradeSum: 20 }),
		];
		const { range } = buildMetricWindow(mixed, "week", TODAY);
		const rows = buildQualityRows(mixed, "grade", "both", range);
		expect(rows[0]!.esame).toBeNull();
		expect(rows[1]!.studio).toBeNull();
		// The study line holds its 30 through the day it did not run.
		expect(rows[1]!.studioCum).toBe(30);
	});

	it("closes the line at the window end when the last day is earlier", () => {
		const early = [stat("2026-04-14", "STUDY", { quizzes: 1, gradeSum: 30 })];
		const { range } = buildMetricWindow(early, "week", TODAY);
		const rows = buildQualityRows(early, "grade", "STUDY", range);
		expect(rows).toHaveLength(2);
		expect(rows[1]!.t).toBe(range.toDay);
		expect(rows[1]!.value).toBeNull();
		expect(rows[1]!.valueCum).toBe(30);
	});
});

describe("qualityDomain", () => {
	it("anchors the floor to the band below the lowest value", () => {
		expect(qualityDomain("grade", [28, 31])).toEqual([27, 33]);
		expect(qualityDomain("grade", [25, 31])).toEqual([24, 33]);
		expect(qualityDomain("grade", [12])).toEqual([0, 33]);
		expect(qualityDomain("accuracy", [86, 92])).toEqual([75, 100]);
	});

	it("falls back to the full scale with no values", () => {
		expect(qualityDomain("grade", [])).toEqual([0, 33]);
		expect(qualityDomain("accuracy", [])).toEqual([0, 100]);
	});
});

describe("buildMetricKpis", () => {
	const daily = [
		// inside the week window (04-12…04-18)
		stat("2026-04-14", "STUDY", {
			quizzes: 2,
			gradeSum: 56,
			answersTotal: 20,
			answersCorrect: 16,
		}),
		// the week before
		stat("2026-04-08", "STUDY", {
			quizzes: 1,
			gradeSum: 24,
			answersTotal: 10,
			answersCorrect: 6,
		}),
	];

	it("reads the window and the one before it", () => {
		const kpis = buildMetricKpis(daily, "week", "STUDY", TODAY);
		const quizzes = kpis.find(k => k.key === "quizzes")!;
		expect(quizzes.value).toBe(2);
		expect(quizzes.previous).toBe(1);
		expect(quizzes.delta).toBe(100);
	});

	it("weights the grade over the whole window, not per bucket", () => {
		const grade = buildMetricKpis(daily, "week", "STUDY", TODAY).find(
			k => k.key === "grade"
		)!;
		expect(grade.value).toBe(28);
	});

	it("has no delta when nothing came before", () => {
		const kpis = buildMetricKpis([daily[0]!], "week", "STUDY", TODAY);
		expect(kpis.every(k => k.delta === null)).toBe(true);
	});
});

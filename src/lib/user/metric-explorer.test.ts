import { describe, expect, it } from "vitest";

import type { QuizMode } from "@/lib/quiz/types";

import {
	type Split,
	type Totals,
	buildMetricWindow,
	metricValue,
	pickTotals,
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

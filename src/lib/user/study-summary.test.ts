import { describe, expect, it } from "vitest";

import { buildStudySummary } from "./study-summary";
import type { DailyStudyStat } from "./types";

function day(over: Partial<DailyStudyStat> & { date: string }): DailyStudyStat {
	return {
		quizMode: "STUDY",
		quizzes: 0,
		gradeSum: 0,
		timeSpent: 0,
		answersTotal: 0,
		answersCorrect: 0,
		...over,
	};
}

const TODAY = new Date("2026-08-16T12:00:00Z");

function metric(daily: DailyStudyStat[], key: string) {
	return buildStudySummary(daily, "week", TODAY).metrics.find(m => m.key === key)!;
}

describe("buildStudySummary", () => {
	it("zeroes out an empty history but keeps the bucket count", () => {
		const summary = buildStudySummary([], "week", TODAY);
		expect(summary.totalQuizzes).toBe(0);
		expect(summary.footer).toBe("0 quiz completati negli ultimi 7 giorni");
		expect(summary.metrics.map(m => m.key)).toEqual([
			"quizzes",
			"grade",
			"accuracy",
			"time",
		]);
		expect(metric([], "quizzes").spark).toHaveLength(7);
		expect(metric([], "quizzes").delta).toBeNull();
	});

	const WEEK: DailyStudyStat[] = [
		// current window (2026-08-10 … 2026-08-16)
		{
			...day({ date: "2026-08-10" }),
			quizzes: 2,
			gradeSum: 50,
			timeSpent: 600_000,
			answersTotal: 20,
			answersCorrect: 14,
		},
		{
			...day({ date: "2026-08-16" }),
			quizzes: 1,
			gradeSum: 30,
			timeSpent: 300_000,
			answersTotal: 10,
			answersCorrect: 9,
		},
		// previous window (2026-08-03 … 2026-08-09)
		{
			...day({ date: "2026-08-05" }),
			quizzes: 1,
			gradeSum: 20,
			timeSpent: 480_000,
			answersTotal: 10,
			answersCorrect: 5,
		},
	];

	it("sums the window and sparks per day", () => {
		const q = metric(WEEK, "quizzes");
		expect(q.value).toBe("3");
		expect(q.spark).toEqual([2, 0, 0, 0, 0, 0, 1]);
		expect(q.delta).toBe(200); // 3 vs 1 the week before
	});

	it("weights the average grade and reads its trend", () => {
		const g = metric(WEEK, "grade");
		// (50 + 30) / 3 = 26.67 → 26.7/33; previous week averaged 20.
		expect(g.value).toBe("26.7/33");
		expect(g.delta).toBe(33);
	});

	it("computes accuracy from answers, not attempts", () => {
		const a = metric(WEEK, "accuracy");
		// 23 / 30 = 76.7% → 77%; previous week 5/10 = 50%.
		expect(a.value).toBe("77%");
		expect(a.delta).toBe(53);
	});

	it("totals the time and formats it", () => {
		const t = metric(WEEK, "time");
		expect(t.value).toBe("15m 0s"); // 900_000 ms
		expect(t.delta).toBe(88); // 900k vs 480k
	});

	it("buckets a month window into four", () => {
		const summary = buildStudySummary(
			[{ ...day({ date: "2026-08-16" }), quizzes: 1 }],
			"month",
			TODAY
		);
		expect(summary.metrics[0]!.spark).toHaveLength(4);
		// today falls in the last (most recent) bucket
		expect(summary.metrics[0]!.spark.at(-1)).toBe(1);
	});
});

describe("quality sparklines", () => {
	it("carry the running average and stay null before the first quiz", () => {
		// A single quiz on the last day of a 7-day window.
		const daily: DailyStudyStat[] = [
			{
				date: "2026-04-18",
				quizMode: "STUDY",
				quizzes: 1,
				gradeSum: 30,
				timeSpent: 0,
				answersTotal: 10,
				answersCorrect: 8,
			},
		];
		const summary = buildStudySummary(daily, "week", new Date("2026-04-18T12:00:00Z"));
		const grade = summary.metrics.find(m => m.key === "grade")!;
		expect(grade.spark).toEqual([null, null, null, null, null, null, 30]);
		const accuracy = summary.metrics.find(m => m.key === "accuracy")!;
		expect(accuracy.spark.slice(0, 6).every(v => v === null)).toBe(true);
		expect(accuracy.spark.at(-1)).toBe(80);
	});
});

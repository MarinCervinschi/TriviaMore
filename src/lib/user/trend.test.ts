import { describe, expect, it } from "vitest";

import {
	THIN_TREND_THRESHOLD,
	bucketKey,
	buildTrendSeries,
	computeTrendStats,
	pickGranularity,
} from "./trend";

describe("computeTrendStats", () => {
	it("returns a thin, zeroed summary for no scores", () => {
		expect(computeTrendStats([])).toEqual({
			count: 0,
			mean: 0,
			stdev: 0,
			delta: 0,
			thin: true,
		});
	});

	it("flags a thin sample below the threshold", () => {
		expect(computeTrendStats([20, 24]).thin).toBe(true);
		expect(computeTrendStats([20, 24, 28]).thin).toBe(false);
		expect(THIN_TREND_THRESHOLD).toBe(3);
	});

	it("reads improvement as last minus first, in order", () => {
		expect(computeTrendStats([18, 22, 27]).delta).toBe(9);
		expect(computeTrendStats([27, 20, 18]).delta).toBe(-9);
	});

	it("delta ignores the middle, mean does not", () => {
		const stats = computeTrendStats([18, 30, 24]);
		expect(stats.delta).toBe(6);
		expect(stats.mean).toBe(24);
	});

	it("measures consistency as the standard deviation", () => {
		expect(computeTrendStats([25, 25, 25])).toMatchObject({ stdev: 0, mean: 25 });
		// mean 20; variance = (100+0+100)/3 = 66.67; sqrt ≈ 8.16
		expect(computeTrendStats([10, 20, 30]).stdev).toBeCloseTo(8.16, 1);
	});

	it("counts a single attempt without dividing by zero", () => {
		expect(computeTrendStats([30])).toEqual({
			count: 1,
			mean: 30,
			stdev: 0,
			delta: 0,
			thin: true,
		});
	});
});

describe("pickGranularity", () => {
	it("scales the bucket to the span", () => {
		expect(pickGranularity(0)).toBe("day");
		expect(pickGranularity(21)).toBe("day");
		expect(pickGranularity(22)).toBe("week");
		expect(pickGranularity(120)).toBe("week");
		expect(pickGranularity(121)).toBe("month");
		expect(pickGranularity(400)).toBe("month");
	});
});

describe("bucketKey", () => {
	it("buckets by day, ISO week (Monday), and month in UTC", () => {
		// 2026-08-13 is a Thursday → week starts Monday 2026-08-10.
		expect(bucketKey("2026-08-13T09:00:00Z", "day")).toBe("2026-08-13");
		expect(bucketKey("2026-08-13T09:00:00Z", "week")).toBe("2026-08-10");
		expect(bucketKey("2026-08-13T09:00:00Z", "month")).toBe("2026-08-01");
	});
});

describe("buildTrendSeries", () => {
	it("is empty for no attempts", () => {
		expect(buildTrendSeries([])).toEqual({ granularity: "day", points: [] });
	});

	it("averages per bucket per mode and leaves gaps as null", () => {
		const { granularity, points } = buildTrendSeries([
			{ completedAt: "2026-08-10T09:00:00Z", score: 20, quizMode: "STUDY" },
			{ completedAt: "2026-08-10T15:00:00Z", score: 30, quizMode: "STUDY" },
			{ completedAt: "2026-08-11T09:00:00Z", score: 24, quizMode: "EXAM_SIMULATION" },
		]);
		expect(granularity).toBe("day");
		expect(points).toEqual([
			{ bucket: "2026-08-10", studio: 25, esame: null },
			{ bucket: "2026-08-11", studio: null, esame: 24 },
		]);
	});

	it("orders buckets chronologically regardless of input order", () => {
		const { points } = buildTrendSeries([
			{ completedAt: "2026-08-11T09:00:00Z", score: 24, quizMode: "STUDY" },
			{ completedAt: "2026-08-10T09:00:00Z", score: 20, quizMode: "STUDY" },
		]);
		expect(points.map(p => p.bucket)).toEqual(["2026-08-10", "2026-08-11"]);
	});
});

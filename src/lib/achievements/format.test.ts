import { describe, expect, it } from "vitest";

import { formatMetricValue } from "./format";

describe("formatMetricValue", () => {
	it("reads a round threshold as hours, without the empty minutes and seconds", () => {
		expect(formatMetricValue("TOTAL_TIME_MS", 36_000_000)).toBe("10h");
		expect(formatMetricValue("TOTAL_TIME_MS", 7_200_000)).toBe("2h");
	});

	it("keeps the minutes when there are any, and drops the seconds", () => {
		expect(formatMetricValue("TOTAL_TIME_MS", 25_709_258)).toBe("7h 8m");
	});

	it("falls back to minutes under an hour", () => {
		expect(formatMetricValue("TOTAL_TIME_MS", 90_000)).toBe("1m");
		expect(formatMetricValue("TOTAL_TIME_MS", 0)).toBe("0m");
	});

	it("leaves a count alone, and floors a fractional one", () => {
		expect(formatMetricValue("DISTINCT_SECTIONS", 14)).toBe("14");
		expect(formatMetricValue("MAX_SECTION_IMPROVEMENT", 6.7)).toBe("6");
	});
});

import { describe, expect, it } from "vitest";

import {
	formatThirtyScaleGrade,
	getGradeChartColor,
	getGradeColor,
	getGradeDescription,
} from "./grading";

describe("formatThirtyScaleGrade", () => {
	it("rounds a score at or below 30 to a whole number", () => {
		expect(formatThirtyScaleGrade(27.4)).toBe("27");
		expect(formatThirtyScaleGrade(30)).toBe("30");
	});

	it("renders anything above 30 as 30L", () => {
		expect(formatThirtyScaleGrade(30.5)).toBe("30L");
		expect(formatThirtyScaleGrade(33)).toBe("30L");
	});
});

describe("getGradeColor", () => {
	it.each([
		[17, "text-destructive"],
		[18, "text-warning"],
		[23, "text-warning"],
		[24, "text-info"],
		[26, "text-info"],
		[27, "text-success"],
		[30, "text-success"],
		[31, "text-purple-600 dark:text-purple-400"],
	])("maps %d to %s", (score, expected) => {
		expect(getGradeColor(score)).toBe(expected);
	});
});

describe("getGradeChartColor", () => {
	it.each([
		[17, "var(--color-destructive)"],
		[18, "var(--color-warning)"],
		[23, "var(--color-warning)"],
		[24, "var(--color-info)"],
		[26, "var(--color-info)"],
		[27, "var(--color-success)"],
		[30, "var(--color-success)"],
		[31, "var(--color-chart-4)"],
	])("maps %d to %s", (score, expected) => {
		expect(getGradeChartColor(score)).toBe(expected);
	});

	it("shares its band edges with getGradeColor", () => {
		for (const score of [0, 17.9, 18, 23.9, 24, 26.9, 27, 30, 30.1]) {
			const textBand = getGradeColor(score);
			const chartBand = getGradeChartColor(score);
			// Both helpers must switch band at the same scores, never one before the other.
			expect(textBand.includes("destructive")).toBe(chartBand.includes("destructive"));
			expect(textBand.includes("warning")).toBe(chartBand.includes("warning"));
			expect(textBand.includes("info")).toBe(chartBand.includes("info"));
			expect(textBand.includes("success")).toBe(chartBand.includes("success"));
		}
	});
});

describe("getGradeDescription", () => {
	it.each([
		[17, "Insufficiente"],
		[18, "Sufficiente"],
		[20, "Sufficiente"],
		[21, "Discreto"],
		[24, "Buono"],
		[27, "Ottimo"],
		[30, "Ottimo"],
		[31, "Eccellente"],
	])("maps %d to %s", (score, expected) => {
		expect(getGradeDescription(score)).toBe(expected);
	});
});

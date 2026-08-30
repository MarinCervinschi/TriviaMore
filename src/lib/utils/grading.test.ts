import { describe, expect, it } from "vitest";

import {
	GRADE_BANDS,
	formatThirtyScaleGrade,
	getGradeChartColor,
	getGradeColor,
	gradeBandIndex,
	pointsToNextBand,
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
		[17, "text-danger"],
		[18, "text-warning"],
		[23, "text-warning"],
		[24, "text-info"],
		[26, "text-info"],
		[27, "text-success"],
		[30, "text-success"],
		[31, "text-chart-4-ink"],
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
		// The invariant is that the two switch band at the same scores. It used to be checked by
		// matching substrings, which quietly required both to be named alike — and they are not:
		// text takes the ink token, a chart fill takes the surface one. Compare where each changes.
		const scores = [0, 17.9, 18, 23.9, 24, 26.9, 27, 30, 30.1];
		const edges = (f: (n: number) => string) =>
			scores.map((score, i) => i > 0 && f(score) !== f(scores[i - 1]));

		expect(edges(getGradeColor)).toEqual(edges(getGradeChartColor));
	});
});

describe("gradeBandIndex", () => {
	it.each([
		[0, 0],
		[17.9, 0],
		[18, 1],
		[23.9, 1],
		[24, 2],
		[26.9, 2],
		[27, 3],
		[30, 3],
		[30.1, 4],
		[33, 4],
	])("puts %s in band %s", (score, index) => {
		expect(gradeBandIndex(score)).toBe(index);
	});
});

describe("pointsToNextBand", () => {
	it("counts up to the floor of the band above", () => {
		expect(pointsToNextBand(16.5)).toEqual({ points: 1.5, band: GRADE_BANDS[1] });
		expect(pointsToNextBand(26.4)).toEqual({ points: 0.6, band: GRADE_BANDS[3] });
	});

	it("rounds to a tenth, so the copy never reads 0.6000000000000014", () => {
		expect(pointsToNextBand(23.4)?.points).toBe(0.6);
	});

	it("has nothing left to reach in the top band", () => {
		expect(pointsToNextBand(30.5)).toBeNull();
		expect(pointsToNextBand(33)).toBeNull();
	});
});

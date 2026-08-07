import { describe, expect, it } from "vitest";

import { formatThirtyScaleGrade, getGradeColor, getGradeDescription } from "./grading";

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

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
		[17, "text-red-600"],
		[18, "text-yellow-600"],
		[23, "text-yellow-600"],
		[24, "text-blue-600"],
		[26, "text-blue-600"],
		[27, "text-green-600"],
		[30, "text-green-600"],
		[31, "text-purple-600"],
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

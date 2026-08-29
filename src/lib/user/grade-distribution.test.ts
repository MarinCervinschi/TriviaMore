import { describe, expect, it } from "vitest";

import { buildGradeDistribution, medianScore } from "./grade-distribution";

describe("buildGradeDistribution", () => {
	it("counts each band and keeps them in band order", () => {
		const slices = buildGradeDistribution([17, 19, 23, 25, 28, 30, 31, 33]);
		expect(slices.map(s => [s.key, s.count])).toEqual([
			["insufficiente", 1],
			["sufficiente", 2],
			["buono", 1],
			["ottimo", 2],
			["eccellente", 2],
		]);
	});

	it("drops the bands nobody landed in", () => {
		expect(buildGradeDistribution([28, 29]).map(s => s.key)).toEqual(["ottimo"]);
	});

	it("splits on the same edges as the grade colours", () => {
		// 30 is the last "ottimo"; anything above it is the top band.
		expect(buildGradeDistribution([30]).map(s => s.key)).toEqual(["ottimo"]);
		expect(buildGradeDistribution([30.5]).map(s => s.key)).toEqual(["eccellente"]);
	});

	it("is empty with no scores", () => {
		expect(buildGradeDistribution([])).toEqual([]);
	});
});

describe("medianScore", () => {
	it("takes the middle of an odd count and the mean of the two middles of an even one", () => {
		expect(medianScore([30, 18, 24])).toBe(24);
		expect(medianScore([18, 24, 28, 30])).toBe(26);
	});

	it("is null with no scores", () => {
		expect(medianScore([])).toBeNull();
	});
});

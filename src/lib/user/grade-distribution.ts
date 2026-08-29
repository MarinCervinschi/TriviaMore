import { GRADE_BANDS, type GradeBand, gradeBand } from "@/lib/utils/grading";

export type GradeSlice = GradeBand & { count: number };

/**
 * How many grades fell in each band, in band order and with the empty ones
 * dropped — a slice worth 0 is not a slice, and a legend row reading "0" says
 * nothing the rest of the chart does not already say.
 */
export function buildGradeDistribution(scores: number[]): GradeSlice[] {
	const counts = new Map<string, number>();
	for (const score of scores) {
		const band = gradeBand(score);
		counts.set(band.key, (counts.get(band.key) ?? 0) + 1);
	}
	return GRADE_BANDS.map(band => ({
		...band,
		count: counts.get(band.key) ?? 0,
	})).filter(slice => slice.count > 0);
}

/**
 * The middle grade, which the ring shows in its centre: it survives a couple of
 * disastrous days, where the mean does not.
 */
export function medianScore(scores: number[]): number | null {
	if (scores.length === 0) return null;
	const sorted = [...scores].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 1
		? sorted[middle]!
		: (sorted[middle - 1]! + sorted[middle]!) / 2;
}

import { GRADE_BANDS, type GradeBand, gradeBand } from "@/lib/utils/grading";

export type GradeSlice = GradeBand & { count: number };

/** Counts per band, in band order, with empty bands dropped. */
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

export function medianScore(scores: number[]): number | null {
	if (scores.length === 0) return null;
	const sorted = [...scores].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 1
		? sorted[middle]!
		: (sorted[middle - 1]! + sorted[middle]!) / 2;
}

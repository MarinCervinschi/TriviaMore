export function formatThirtyScaleGrade(score: number): string {
	if (score <= 30) return Math.round(score).toString();
	return "30L";
}

/**
 * An average/aggregate grade against the 33-point max: "26/33", "26.4/33". The
 * raw score, not the 18–30L exam convention, so the denominator makes sense.
 */
export function formatGradeOutOf33(score: number): string {
	return `${Math.round(score * 10) / 10}/33`;
}

export type GradeBand = {
	key: string;
	/** What the band is called, for a sentence that has to name it. */
	name: string;
	/** The range as a reader sees it, for a legend or an axis. */
	label: string;
	/** The tint for text — the ink half of the pair. */
	text: string;
	/** The same ink as a fill, for a mark that sits beside text rather than in a plot. */
	mark: string;
	/** The fill a chart mark takes — the surface half. */
	chart: string;
};

/**
 * The five bands a grade falls in. One table, so a tint, a chart fill and a
 * distribution's slices can never disagree about what a grade means; `gradeBand`
 * below owns the edges, which is the only place they are written down.
 */
export const GRADE_BANDS: GradeBand[] = [
	{
		key: "insufficiente",
		name: "Insufficiente",
		label: "Sotto 18",
		text: "text-danger",
		mark: "bg-danger",
		chart: "var(--color-destructive)",
	},
	{
		key: "sufficiente",
		name: "Sufficiente",
		label: "18–23",
		text: "text-warning",
		mark: "bg-warning",
		chart: "var(--color-warning)",
	},
	{
		key: "buono",
		name: "Buono",
		label: "24–26",
		text: "text-info",
		mark: "bg-info",
		chart: "var(--color-info)",
	},
	{
		key: "ottimo",
		name: "Ottimo",
		label: "27–30",
		text: "text-success",
		mark: "bg-success",
		chart: "var(--color-success)",
	},
	{
		key: "eccellente",
		name: "Eccellente",
		label: "31–33",
		text: "text-chart-4-ink",
		mark: "bg-chart-4-ink",
		chart: "var(--color-chart-4)",
	},
];

/** The index of the band a score falls in. The edges live here and nowhere else. */
export function gradeBandIndex(score: number): number {
	if (score < 18) return 0;
	if (score < 24) return 1;
	if (score < 27) return 2;
	if (score <= 30) return 3;
	return 4;
}

/** The band a score falls in. */
export function gradeBand(score: number): GradeBand {
	return GRADE_BANDS[gradeBandIndex(score)]!;
}

/** Where each band above the first starts, for "how far to the next one". */
const BAND_FLOORS = [18, 24, 27, 31];

/**
 * How much is missing to reach the band above, and which one it is — null in the
 * top band, where there is nothing left to reach.
 */
export function pointsToNextBand(
	score: number
): { points: number; band: GradeBand } | null {
	const index = gradeBandIndex(score);
	const floor = BAND_FLOORS[index];
	if (floor === undefined) return null;
	return {
		points: Math.round((floor - score) * 10) / 10,
		band: GRADE_BANDS[index + 1]!,
	};
}

export function getGradeColor(score: number): string {
	return gradeBand(score).text;
}

/** The same band, as a colour a chart mark can be filled with. */
export function getGradeChartColor(score: number): string {
	return gradeBand(score).chart;
}

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
	/** The range as a reader sees it, for a legend or an axis. */
	label: string;
	/** The tint for text — the ink half of the pair. */
	text: string;
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
		label: "Sotto 18",
		text: "text-danger",
		chart: "var(--color-destructive)",
	},
	{
		key: "sufficiente",
		label: "18–23",
		text: "text-warning",
		chart: "var(--color-warning)",
	},
	{
		key: "buono",
		label: "24–26",
		text: "text-info",
		chart: "var(--color-info)",
	},
	{
		key: "ottimo",
		label: "27–30",
		text: "text-success",
		chart: "var(--color-success)",
	},
	{
		key: "eccellente",
		label: "31–33",
		text: "text-chart-4-ink",
		chart: "var(--color-chart-4)",
	},
];

/** The band a score falls in. The edges live here and nowhere else. */
export function gradeBand(score: number): GradeBand {
	if (score < 18) return GRADE_BANDS[0]!;
	if (score < 24) return GRADE_BANDS[1]!;
	if (score < 27) return GRADE_BANDS[2]!;
	if (score <= 30) return GRADE_BANDS[3]!;
	return GRADE_BANDS[4]!;
}

export function getGradeColor(score: number): string {
	return gradeBand(score).text;
}

/** The same band, as a colour a chart mark can be filled with. */
export function getGradeChartColor(score: number): string {
	return gradeBand(score).chart;
}

export function getGradeDescription(score: number): string {
	if (score < 18) return "Insufficiente";
	if (score < 21) return "Sufficiente";
	if (score < 24) return "Discreto";
	if (score < 27) return "Buono";
	if (score <= 30) return "Ottimo";
	return "Eccellente";
}

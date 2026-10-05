export function formatThirtyScaleGrade(score: number): string {
	if (score <= 30) return Math.round(score).toString();
	return "30L";
}

/** "26/33" or "26.4/33", on the raw 33-point scale. */
export function formatGradeOutOf33(score: number): string {
	return `${Math.round(score * 10) / 10}/33`;
}

export type GradeBand = {
	key: string;
	name: string;
	label: string;
	/** The ink token, for text. */
	text: string;
	/** The ink as a fill, for a mark beside text. */
	mark: string;
	/** The surface token, for a chart mark. */
	chart: string;
};

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

/** The band edges live here and nowhere else. */
export function gradeBandIndex(score: number): number {
	if (score < 18) return 0;
	if (score < 24) return 1;
	if (score < 27) return 2;
	if (score <= 30) return 3;
	return 4;
}

export function gradeBand(score: number): GradeBand {
	return GRADE_BANDS[gradeBandIndex(score)]!;
}

const BAND_FLOORS = [18, 24, 27, 31];

/** null in the top band. */
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

export function getGradeChartColor(score: number): string {
	return gradeBand(score).chart;
}

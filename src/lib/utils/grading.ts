export function formatThirtyScaleGrade(score: number): string {
	if (score <= 30) return Math.round(score).toString();
	return "30L";
}

export function getGradeColor(score: number): string {
	if (score < 18) return "text-danger";
	if (score < 24) return "text-warning";
	if (score < 27) return "text-info";
	if (score <= 30) return "text-success";
	return "text-purple-600 dark:text-purple-400";
}

/**
 * The same bands as `getGradeColor`, as a colour a chart mark can be filled
 * with. Kept beside it so the two can never disagree about what a grade means.
 */
export function getGradeChartColor(score: number): string {
	if (score < 18) return "var(--color-destructive)";
	if (score < 24) return "var(--color-warning)";
	if (score < 27) return "var(--color-info)";
	if (score <= 30) return "var(--color-success)";
	return "var(--color-chart-4)";
}

export function getGradeDescription(score: number): string {
	if (score < 18) return "Insufficiente";
	if (score < 21) return "Sufficiente";
	if (score < 24) return "Discreto";
	if (score < 27) return "Buono";
	if (score <= 30) return "Ottimo";
	return "Eccellente";
}

import { formatGradeOutOf33 } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

import type { DailyStudyStat } from "./types";

export type SummaryPeriod = "week" | "month" | "year";

export type SummaryMetric = {
	key: "quizzes" | "grade" | "accuracy" | "time";
	/** Display-ready value for the window. */
	value: string;
	/** Percent change vs the previous window; null when there is no baseline. */
	delta: number | null;
	/** One value per sub-bucket of the window, for the sparkline. */
	spark: number[];
};

export type StudySummary = {
	metrics: SummaryMetric[];
	totalQuizzes: number;
	footer: string;
};

const WINDOW: Record<SummaryPeriod, { days: number; buckets: number; label: string }> =
	{
		week: { days: 7, buckets: 7, label: "negli ultimi 7 giorni" },
		month: { days: 28, buckets: 4, label: "nell'ultimo mese" },
		year: { days: 364, buckets: 12, label: "nell'ultimo anno" },
	};

function epochDay(iso: string): number {
	return Math.floor(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) / 86_400_000);
}

type Bucket = {
	quizzes: number;
	gradeSum: number;
	timeSpent: number;
	answersTotal: number;
	answersCorrect: number;
};

const zero = (): Bucket => ({
	quizzes: 0,
	gradeSum: 0,
	timeSpent: 0,
	answersTotal: 0,
	answersCorrect: 0,
});

function add(target: Bucket, stat: Bucket) {
	target.quizzes += stat.quizzes;
	target.gradeSum += stat.gradeSum;
	target.timeSpent += stat.timeSpent;
	target.answersTotal += stat.answersTotal;
	target.answersCorrect += stat.answersCorrect;
}

// null, not 0, when there is nothing before to compare against — the badge is
// hidden rather than reading a real "no change".
function pctChange(current: number, previous: number): number | null {
	return previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
}

/**
 * Windows the daily stats into a period's metrics: a value over the window, the
 * percent change vs the previous window of equal length, and a per-sub-bucket
 * series for the sparkline. `today` is injected so the function stays pure.
 */
export function buildStudySummary(
	daily: DailyStudyStat[],
	period: SummaryPeriod,
	today: Date
): StudySummary {
	const { days, buckets, label } = WINDOW[period];
	const todayDay = epochDay(today.toISOString());
	const startDay = todayDay - (days - 1);
	const prevStart = startDay - days;

	const current: Bucket[] = Array.from({ length: buckets }, zero);
	const previous = zero();

	for (const stat of daily) {
		const day = epochDay(stat.date);
		if (day >= startDay && day <= todayDay) {
			const offset = day - startDay;
			const bucket = Math.min(buckets - 1, Math.floor((offset * buckets) / days));
			add(current[bucket]!, stat);
		} else if (day >= prevStart && day < startDay) {
			add(previous, stat);
		}
	}

	const total = current.reduce<Bucket>((acc, bucket) => {
		add(acc, bucket);
		return acc;
	}, zero());

	const avgGrade = total.quizzes ? total.gradeSum / total.quizzes : 0;
	const accuracy = total.answersTotal
		? (total.answersCorrect / total.answersTotal) * 100
		: 0;
	const prevAvgGrade = previous.quizzes ? previous.gradeSum / previous.quizzes : 0;
	const prevAccuracy = previous.answersTotal
		? (previous.answersCorrect / previous.answersTotal) * 100
		: 0;

	const metrics: SummaryMetric[] = [
		{
			key: "quizzes",
			value: String(total.quizzes),
			delta: pctChange(total.quizzes, previous.quizzes),
			spark: current.map(b => b.quizzes),
		},
		{
			key: "grade",
			value: formatGradeOutOf33(avgGrade),
			delta: pctChange(avgGrade, prevAvgGrade),
			spark: current.map(b => (b.quizzes ? b.gradeSum / b.quizzes : 0)),
		},
		{
			key: "accuracy",
			value: `${Math.round(accuracy)}%`,
			delta: pctChange(accuracy, prevAccuracy),
			spark: current.map(b =>
				b.answersTotal ? (b.answersCorrect / b.answersTotal) * 100 : 0
			),
		},
		{
			key: "time",
			value: formatTimeSpent(total.timeSpent),
			delta: pctChange(total.timeSpent, previous.timeSpent),
			spark: current.map(b => b.timeSpent),
		},
	];

	return {
		metrics,
		totalQuizzes: total.quizzes,
		footer: `${total.quizzes} quiz completati ${label}`,
	};
}

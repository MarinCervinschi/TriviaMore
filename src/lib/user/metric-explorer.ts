import { format } from "date-fns";
import { it } from "date-fns/locale";

import type { QuizMode } from "@/lib/quiz/types";

import type { DailyStudyStat } from "./types";

export type MetricKey = "quizzes" | "grade" | "accuracy" | "time";
export type ExplorerPeriod = "week" | "month" | "year" | "all";
export type ExplorerMode = "both" | QuizMode;

export type Totals = {
	quizzes: number;
	gradeSum: number;
	timeSpent: number;
	answersTotal: number;
	answersCorrect: number;
};

// Each bucket keeps the two modes apart, so "Entrambi" can plot them as two
// series while a single mode reads its own side.
export type Split = { studio: Totals; esame: Totals };
export type LabeledBucket = Split & { label: string };

const zero = (): Totals => ({
	quizzes: 0,
	gradeSum: 0,
	timeSpent: 0,
	answersTotal: 0,
	answersCorrect: 0,
});

function addRow(target: Totals, source: Totals) {
	target.quizzes += source.quizzes;
	target.gradeSum += source.gradeSum;
	target.timeSpent += source.timeSpent;
	target.answersTotal += source.answersTotal;
	target.answersCorrect += source.answersCorrect;
}

export function combineTotals(a: Totals, b: Totals): Totals {
	const t = zero();
	addRow(t, a);
	addRow(t, b);
	return t;
}

/** The totals a mode reads: one side, or both summed for "Entrambi". */
export function pickTotals(split: Split, mode: ExplorerMode): Totals {
	if (mode === "STUDY") return split.studio;
	if (mode === "EXAM_SIMULATION") return split.esame;
	return combineTotals(split.studio, split.esame);
}

export function metricValue(t: Totals, key: MetricKey): number {
	switch (key) {
		case "quizzes":
			return t.quizzes;
		case "grade":
			return t.quizzes ? t.gradeSum / t.quizzes : 0;
		case "accuracy":
			return t.answersTotal ? (100 * t.answersCorrect) / t.answersTotal : 0;
		case "time":
			return t.timeSpent;
	}
}

function epochDay(iso: string): number {
	return Math.floor(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) / 86_400_000);
}

// Buckets are keyed in UTC, like the `date` the query groups by. `format` reads
// the host timezone, so it is handed the same calendar day as a *local* Date —
// otherwise the server and a browser west of UTC label the same bucket
// differently and React reports a hydration mismatch on the axis.
function dayLabel(day: number): string {
	const utc = new Date(day * 86_400_000);
	const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
	return format(local, "d MMM", { locale: it });
}

function monthsBack(today: Date, n: number): { key: string; label: string }[] {
	const y = today.getUTCFullYear();
	const m = today.getUTCMonth();
	const out: { key: string; label: string }[] = [];
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(y, m - i, 1);
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		out.push({ key, label: format(d, "LLL yy", { locale: it }) });
	}
	return out;
}

function allMonths(
	rows: DailyStudyStat[],
	today: Date
): { key: string; label: string }[] {
	if (rows.length === 0) return monthsBack(today, 1);
	const minIso = rows.reduce((a, r) => (r.date < a ? r.date : a), rows[0]!.date);
	const start = new Date(`${minIso.slice(0, 7)}-01T00:00:00Z`);
	const span =
		(today.getUTCFullYear() - start.getUTCFullYear()) * 12 +
		(today.getUTCMonth() - start.getUTCMonth()) +
		1;
	return monthsBack(today, span);
}

function emptyBucket(label: string): LabeledBucket {
	return { label, studio: zero(), esame: zero() };
}

function into(bucket: Split, stat: DailyStudyStat) {
	addRow(stat.quizMode === "STUDY" ? bucket.studio : bucket.esame, stat);
}

/**
 * Windows mode-split daily stats into labeled buckets for the chart, plus the
 * previous equal window for the tab deltas. `today` is injected so the function
 * stays pure. Week is 7 daily buckets, month 4 weekly, year 12 monthly, all the
 * full calendar-month span of the data.
 */
export function buildMetricWindow(
	daily: DailyStudyStat[],
	period: ExplorerPeriod,
	today: Date
): { buckets: LabeledBucket[]; previous: Split } {
	const todayDay = epochDay(today.toISOString());
	const previous: Split = { studio: zero(), esame: zero() };

	if (period === "week" || period === "month") {
		const days = period === "week" ? 7 : 28;
		const count = period === "week" ? 7 : 4;
		const startDay = todayDay - (days - 1);
		const prevStart = startDay - days;
		const buckets = Array.from({ length: count }, (_, i) =>
			emptyBucket(dayLabel(startDay + Math.floor((i * days) / count)))
		);
		for (const stat of daily) {
			const day = epochDay(stat.date);
			if (day >= startDay && day <= todayDay) {
				into(
					buckets[Math.min(count - 1, Math.floor(((day - startDay) * count) / days))]!,
					stat
				);
			} else if (day >= prevStart && day < startDay) {
				into(previous, stat);
			}
		}
		return { buckets, previous };
	}

	const months = period === "year" ? monthsBack(today, 12) : allMonths(daily, today);
	const index = new Map(months.map((m, i) => [m.key, i]));
	const buckets = months.map(m => emptyBucket(m.label));
	const prevKeys =
		period === "year"
			? new Set(
					monthsBack(
						new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 12, 1)),
						12
					).map(m => m.key)
				)
			: new Set<string>();
	for (const stat of daily) {
		const key = stat.date.slice(0, 7);
		const idx = index.get(key);
		if (idx !== undefined) into(buckets[idx]!, stat);
		else if (prevKeys.has(key)) into(previous, stat);
	}
	return { buckets, previous };
}

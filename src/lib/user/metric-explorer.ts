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

export type Split = { studio: Totals; esame: Totals };
/** `startDay` is the bucket's first day, so a time axis can place its tick. */
export type LabeledBucket = Split & { label: string; startDay: number };

export type DayRange = { fromDay: number; toDay: number };

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

export function pickTotals(split: Split, mode: ExplorerMode): Totals {
	if (mode === "STUDY") return split.studio;
	if (mode === "EXAM_SIMULATION") return split.esame;
	return combineTotals(split.studio, split.esame);
}

/** `flow` metrics are sums, so an empty bucket is zero; `quality` metrics are ratios with no value there. */
export const METRIC_FAMILY: Record<MetricKey, "flow" | "quality"> = {
	quizzes: "flow",
	time: "flow",
	grade: "quality",
	accuracy: "quality",
};

/** Zero when the window is empty. */
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

/** `null` for a ratio with nothing to average. */
export function metricPoint(t: Totals, key: MetricKey): number | null {
	switch (key) {
		case "quizzes":
			return t.quizzes;
		case "time":
			return t.timeSpent;
		case "grade":
			return t.quizzes ? t.gradeSum / t.quizzes : null;
		case "accuracy":
			return t.answersTotal ? (100 * t.answersCorrect) / t.answersTotal : null;
	}
}

function epochDay(iso: string): number {
	return Math.floor(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) / 86_400_000);
}

// Buckets are keyed in UTC, so the day goes to `format` as a local Date, or hydration mismatches.
export function formatDayLabel(day: number): string {
	const utc = new Date(day * 86_400_000);
	const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
	return format(local, "d MMM", { locale: it });
}

type Month = { key: string; label: string; startDay: number };

function monthsBack(today: Date, n: number): Month[] {
	const y = today.getUTCFullYear();
	const m = today.getUTCMonth();
	const out: Month[] = [];
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(y, m - i, 1);
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		out.push({
			key,
			label: format(d, "LLL yy", { locale: it }),
			startDay: epochDay(`${key}-01`),
		});
	}
	return out;
}

function allMonths(rows: DailyStudyStat[], today: Date): Month[] {
	if (rows.length === 0) return monthsBack(today, 1);
	const minIso = rows.reduce((a, r) => (r.date < a ? r.date : a), rows[0]!.date);
	const start = new Date(`${minIso.slice(0, 7)}-01T00:00:00Z`);
	const span =
		(today.getUTCFullYear() - start.getUTCFullYear()) * 12 +
		(today.getUTCMonth() - start.getUTCMonth()) +
		1;
	return monthsBack(today, span);
}

function emptyBucket(label: string, startDay: number): LabeledBucket {
	return { label, startDay, studio: zero(), esame: zero() };
}

function into(bucket: Split, stat: DailyStudyStat) {
	addRow(stat.quizMode === "STUDY" ? bucket.studio : bucket.esame, stat);
}

/** Week is 7 daily buckets, month 4 weekly, year 12 monthly; `previous` is the window before. */
export function buildMetricWindow(
	daily: DailyStudyStat[],
	period: ExplorerPeriod,
	today: Date
): { buckets: LabeledBucket[]; previous: Split; range: DayRange } {
	const todayDay = epochDay(today.toISOString());
	const previous: Split = { studio: zero(), esame: zero() };

	if (period === "week" || period === "month") {
		const days = period === "week" ? 7 : 28;
		const count = period === "week" ? 7 : 4;
		const startDay = todayDay - (days - 1);
		const prevStart = startDay - days;
		const buckets = Array.from({ length: count }, (_, i) => {
			const day = startDay + Math.floor((i * days) / count);
			return emptyBucket(formatDayLabel(day), day);
		});
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
		return { buckets, previous, range: { fromDay: startDay, toDay: todayDay } };
	}

	const months = period === "year" ? monthsBack(today, 12) : allMonths(daily, today);
	const index = new Map(months.map((m, i) => [m.key, i]));
	const buckets = months.map(m => emptyBucket(m.label, m.startDay));
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
	return {
		buckets,
		previous,
		range: { fromDay: buckets[0]!.startDay, toDay: todayDay },
	};
}

export type DayTotals = { day: number; split: Split };

/** Ordered, with empty days omitted. */
export function dayTotals(
	daily: DailyStudyStat[],
	{ fromDay, toDay }: DayRange
): DayTotals[] {
	const byDay = new Map<number, Split>();
	for (const stat of daily) {
		const day = epochDay(stat.date);
		if (day < fromDay || day > toDay) continue;
		let split = byDay.get(day);
		if (!split) {
			split = { studio: zero(), esame: zero() };
			byDay.set(day, split);
		}
		into(split, stat);
	}
	return [...byDay.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([day, split]) => ({ day, split }));
}

function qualitySeriesKeys(mode: ExplorerMode): string[] {
	return mode === "both" ? ["studio", "esame"] : ["value"];
}

/** `<key>` is the day's average and `<key>Cum` the running one; a closing row reaches the window's end. */
export function buildQualityRows(
	daily: DailyStudyStat[],
	key: MetricKey,
	mode: ExplorerMode,
	range: DayRange
): Record<string, number | null>[] {
	const sides = qualitySeriesKeys(mode).map(name => ({
		name,
		totals: zero(),
		pick: (split: Split) =>
			name === "studio"
				? split.studio
				: name === "esame"
					? split.esame
					: pickTotals(split, mode),
	}));

	const rows = dayTotals(daily, range).map(({ day, split }) => {
		const row: Record<string, number | null> = { t: day };
		for (const side of sides) {
			const own = side.pick(split);
			row[side.name] = metricPoint(own, key);
			addRow(side.totals, own);
			row[`${side.name}Cum`] = metricPoint(side.totals, key);
		}
		return row;
	});

	const last = rows.at(-1);
	if (last && last.t !== range.toDay) {
		const closing: Record<string, number | null> = { t: range.toDay };
		for (const side of sides) {
			closing[side.name] = null;
			closing[`${side.name}Cum`] = last[`${side.name}Cum`] ?? null;
		}
		rows.push(closing);
	}
	return rows;
}

/** Anchored to the grade bands, so the axis stays readable. */
export function qualityDomain(key: MetricKey, values: number[]): [number, number] {
	const steps = key === "accuracy" ? [0, 25, 50, 75] : [0, 18, 24, 27];
	const top = key === "accuracy" ? 100 : 33;
	if (values.length === 0) return [0, top];
	const min = Math.min(...values);
	return [steps.filter(step => step <= min).pop() ?? 0, top];
}

export type MetricKpi = {
	key: MetricKey;
	value: number;
	previous: number;
	/** Percent change against the previous window; `null` when there is no baseline. */
	delta: number | null;
};

/** The delta is `null` when nothing came before. */
export function buildMetricKpis(
	daily: DailyStudyStat[],
	period: ExplorerPeriod,
	mode: ExplorerMode,
	today: Date
): MetricKpi[] {
	const { buckets, previous } = buildMetricWindow(daily, period, today);
	const current = zero();
	for (const bucket of buckets) addRow(current, pickTotals(bucket, mode));
	const before = pickTotals(previous, mode);

	return (["quizzes", "grade", "accuracy", "time"] as const).map(key => {
		const value = metricValue(current, key);
		const prior = metricValue(before, key);
		return {
			key,
			value,
			previous: prior,
			delta: prior === 0 ? null : Math.round(((value - prior) / prior) * 100),
		};
	});
}

/** An epoch day; `all` has no floor. */
function windowStartDay(period: ExplorerPeriod, today: Date): number {
	const todayDay = epochDay(today.toISOString());
	if (period === "week") return todayDay - 6;
	if (period === "month") return todayDay - 27;
	if (period === "year") {
		const start = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1)
		);
		return epochDay(start.toISOString());
	}
	return Number.NEGATIVE_INFINITY;
}

export function attemptsInWindow<
	T extends { completedAt: string; quizMode: QuizMode | null },
>(attempts: T[], period: ExplorerPeriod, mode: ExplorerMode, today: Date): T[] {
	const from = windowStartDay(period, today);
	return attempts.filter(attempt => {
		if (mode !== "both" && attempt.quizMode !== mode) return false;
		return epochDay(attempt.completedAt) >= from;
	});
}

export function windowFromDate(
	period: ExplorerPeriod,
	today: Date
): string | undefined {
	if (period === "all") return undefined;
	const day = windowStartDay(period, today);
	return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

import type { QuizMode } from "@/lib/quiz/types";

export type TrendStats = {
	count: number;
	mean: number;
	/** Standard deviation of the scores — lower means more consistent. */
	stdev: number;
	/** Last score minus first, in chronological order — the improvement. */
	delta: number;
	/** Too few attempts to read a trend into: don't show a confident direction. */
	thin: boolean;
};

// Below this, a "trend" is noise — two points always make a perfect line.
export const THIN_TREND_THRESHOLD = 3;

/**
 * Summary of a chronological run of scores. `scores` must already be ordered by
 * time; the caller owns the ordering because it also owns the grouping.
 */
export function computeTrendStats(scores: number[]): TrendStats {
	const count = scores.length;
	if (count === 0) {
		return { count: 0, mean: 0, stdev: 0, delta: 0, thin: true };
	}

	const mean = scores.reduce((sum, score) => sum + score, 0) / count;
	const variance = scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / count;
	const stdev = Math.sqrt(variance);
	const delta = scores[count - 1]! - scores[0]!;

	return {
		count,
		mean: Number(mean.toFixed(2)),
		stdev: Number(stdev.toFixed(2)),
		delta: Number(delta.toFixed(2)),
		thin: count < THIN_TREND_THRESHOLD,
	};
}

export type Granularity = "day" | "week" | "month";

// Chosen so the chart lands on roughly a dozen buckets whatever the span: dense
// data doesn't crowd, thin data isn't smeared into one point.
export function pickGranularity(spanDays: number): Granularity {
	if (spanDays <= 21) return "day";
	if (spanDays <= 120) return "week";
	return "month";
}

function spanDays(firstIso: string, lastIso: string): number {
	return (new Date(lastIso).getTime() - new Date(firstIso).getTime()) / 86_400_000;
}

// The bucket an attempt falls in, as its start day (YYYY-MM-DD), computed in UTC
// to match how the day is stored across the app.
export function bucketKey(iso: string, granularity: Granularity): string {
	if (granularity === "day") return iso.slice(0, 10);

	const date = new Date(iso);
	if (granularity === "month") {
		const month = String(date.getUTCMonth() + 1).padStart(2, "0");
		return `${date.getUTCFullYear()}-${month}-01`;
	}

	// week: back up to Monday, in UTC.
	const mondayOffset = (date.getUTCDay() + 6) % 7;
	const monday = new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate() - mondayOffset
		)
	);
	return monday.toISOString().slice(0, 10);
}

export type TrendPoint = {
	bucket: string;
	studio: number | null;
	esame: number | null;
};

type TrendAttempt = { completedAt: string; score: number; quizMode: QuizMode | null };

/**
 * Average score per time bucket, split by mode, for the score-over-time chart.
 * Granularity adapts to the span so the point count stays bounded. A mode with
 * no attempts in a bucket is `null` (a gap), never a fabricated zero.
 */
export function buildTrendSeries(attempts: TrendAttempt[]): {
	granularity: Granularity;
	points: TrendPoint[];
} {
	if (attempts.length === 0) return { granularity: "day", points: [] };

	const ordered = [...attempts].sort((a, b) =>
		a.completedAt.localeCompare(b.completedAt)
	);
	const granularity = pickGranularity(
		spanDays(ordered[0]!.completedAt, ordered[ordered.length - 1]!.completedAt)
	);

	type Acc = { studioSum: number; studioN: number; esameSum: number; esameN: number };
	const buckets = new Map<string, Acc>();
	const order: string[] = [];

	for (const attempt of ordered) {
		const key = bucketKey(attempt.completedAt, granularity);
		let acc = buckets.get(key);
		if (!acc) {
			acc = { studioSum: 0, studioN: 0, esameSum: 0, esameN: 0 };
			buckets.set(key, acc);
			order.push(key);
		}
		if (attempt.quizMode === "STUDY") {
			acc.studioSum += attempt.score;
			acc.studioN += 1;
		} else if (attempt.quizMode === "EXAM_SIMULATION") {
			acc.esameSum += attempt.score;
			acc.esameN += 1;
		}
	}

	const points = order.map(key => {
		const acc = buckets.get(key)!;
		return {
			bucket: key,
			studio: acc.studioN ? Number((acc.studioSum / acc.studioN).toFixed(2)) : null,
			esame: acc.esameN ? Number((acc.esameSum / acc.esameN).toFixed(2)) : null,
		};
	});

	return { granularity, points };
}

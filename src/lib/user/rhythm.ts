import { localDayIndex, localHour } from "@/lib/utils/datetime";

import type { AttemptHistoryEntry } from "./types";

export type ScoreConsistency = {
	mean: number;
	/** Population standard deviation of the recent scores. */
	stdev: number;
	count: number;
	/** Fewer than three samples — not a confident signal; say so in the UI. */
	thin: boolean;
};

export type StudyRhythm = {
	currentStreak: number;
	longestStreak: number;
	/** Distinct active days within the trailing window. */
	activeDays: number;
	windowDays: number;
	/** Completions per hour of the local day, length 24. */
	byHour: number[];
	/** Hour with the most completions, or null when there is no activity. */
	peakHour: number | null;
	consistency: ScoreConsistency;
};

export type RhythmAttempt = Pick<AttemptHistoryEntry, "completedAt" | "score">;

const CONSISTENCY_SAMPLE = 10;

function consistencyOf(scores: number[]): ScoreConsistency {
	const count = scores.length;
	if (count === 0) return { mean: 0, stdev: 0, count: 0, thin: true };
	const mean = scores.reduce((sum, s) => sum + s, 0) / count;
	const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / count;
	return { mean, stdev: Math.sqrt(variance), count, thin: count < 3 };
}

/**
 * Study rhythm from the completed-attempt timestamps: streaks and active days
 * (as whole local calendar days), the hour-of-day distribution, and the score
 * consistency over the most recent runs. Pure — `today` is injected so it is
 * deterministic in tests and stories.
 */
export function computeStudyRhythm(
	attempts: RhythmAttempt[],
	today: Date,
	windowDays = 30
): StudyRhythm {
	const byHour = new Array<number>(24).fill(0);
	const dayIndices = new Set<number>();

	for (const attempt of attempts) {
		dayIndices.add(localDayIndex(attempt.completedAt));
		byHour[localHour(attempt.completedAt)]! += 1;
	}

	const todayIndex = localDayIndex(today);

	// A streak is unbroken while today is still open: anchor it to today if
	// active, otherwise to yesterday, so a day without a quiz yet doesn't read
	// as a broken streak until it actually ends.
	let currentStreak = 0;
	const anchor = dayIndices.has(todayIndex)
		? todayIndex
		: dayIndices.has(todayIndex - 1)
			? todayIndex - 1
			: null;
	if (anchor !== null) {
		let cursor = anchor;
		while (dayIndices.has(cursor)) {
			currentStreak += 1;
			cursor -= 1;
		}
	}

	let longestStreak = 0;
	let run = 0;
	let prev: number | null = null;
	for (const index of [...dayIndices].sort((a, b) => a - b)) {
		run = prev !== null && index === prev + 1 ? run + 1 : 1;
		if (run > longestStreak) longestStreak = run;
		prev = index;
	}

	let activeDays = 0;
	for (const index of dayIndices) {
		if (index > todayIndex - windowDays && index <= todayIndex) activeDays += 1;
	}

	const peak = byHour.reduce(
		(best, count, hour) => (count > best.count ? { hour, count } : best),
		{ hour: -1, count: 0 }
	);

	const recentScores = [...attempts]
		.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
		.slice(0, CONSISTENCY_SAMPLE)
		.map(a => a.score);

	return {
		currentStreak,
		longestStreak,
		activeDays,
		windowDays,
		byHour,
		peakHour: peak.hour === -1 ? null : peak.hour,
		consistency: consistencyOf(recentScores),
	};
}

// Time-limit options for quiz sessions, in minutes.
// An index equal to TIME_STEPS.length represents "unlimited" (timeLimit: null).
export const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120] as const;

// Only has to outlast the longest plausible sitting, so no reap hits a live one.
export const ABANDONED_ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;

export function abandonedAttemptCutoff(now: number = Date.now()): string {
	return new Date(now - ABANDONED_ATTEMPT_TTL_MS).toISOString();
}

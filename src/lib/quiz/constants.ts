// Time-limit options for quiz sessions, in minutes.
// An index equal to TIME_STEPS.length represents "unlimited" (timeLimit: null).
export const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120] as const;

// A backstop, not a policy: the resume banner is what stands between a live
// sitting and the reap, so this only bounds how long a forgotten one lingers.
export const ABANDONED_ATTEMPT_TTL_HOURS = 48;

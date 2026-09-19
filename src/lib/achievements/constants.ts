/**
 * The thresholds the metrics are built on. Shared deliberately: the incremental
 * rollup and the recompute that reconciles it must agree, and the only way to
 * guarantee that is for neither to own the number.
 */
export const PERFECT_SCORE = 33;
export const PERFECT_MIN_ANSWERS = 10;
export const EXAM_PASS_SCORE = 27;
export const EXAM_MIN_ANSWERS = 15;
export const IMPROVEMENT_MIN_RUNS = 3;
export const ACTIVE_WEEK_MIN_DAYS = 3;

/** A study day is Europe/Rome, which is what the streak is counted in. */
export const ACTIVITY_ZONE = "Europe/Rome";

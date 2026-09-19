import type { achievements, userAchievements } from "@/db/schema";

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type AchievementMetric = Achievement["metric"];
export type AchievementComparator = Achievement["comparator"];

/** Every measure the engine knows how to compute, for one user. */
export type MetricSnapshot = Record<AchievementMetric, number>;

export type UserMetrics = {
	userId: string;
	metrics: MetricSnapshot;
};

/** The part of a catalogue row the evaluation actually reads. */
export type AchievementRule = Pick<
	Achievement,
	"key" | "family" | "tier" | "metric" | "comparator" | "threshold"
>;

export type AchievementProgress = {
	value: number;
	target: number;
	/** Clamped to 0–1, so a metric that moved past the threshold still reads as full. */
	ratio: number;
};

export type AchievementUnlock = {
	key: string;
	metricValue: number;
};

/** One catalogue entry as the interface reads it: the row, plus this user's standing. */
export type AchievementView = Pick<
	Achievement,
	| "key"
	| "family"
	| "tier"
	| "name"
	| "description"
	| "category"
	| "metric"
	| "icon"
	| "accent"
	| "shape"
> & {
	awardedAt: string | null;
	/** null for a binary or "lower is better" rule, which has no bar. */
	progress: AchievementProgress | null;
	pinPosition: number | null;
};

export type AchievementCategory = {
	category: string;
	achievements: AchievementView[];
};

export type AchievementsOverview = {
	categories: AchievementCategory[];
	unlocked: number;
	total: number;
	/** The locked entries closest to their threshold, nearest first. */
	nextUp: AchievementView[];
	/** What the student chose to show, in the order they chose. */
	pinned: AchievementView[];
};

/** What an unlock needs to be announced: enough to draw the medal and name it. */
export type UnlockedAchievement = Pick<
	Achievement,
	"key" | "name" | "description" | "icon" | "accent" | "shape" | "tier"
>;

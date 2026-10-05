import type { achievements, userAchievements } from "@/db/schema";

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type AchievementMetric = Achievement["metric"];
export type AchievementComparator = Achievement["comparator"];

export type MetricSnapshot = Record<AchievementMetric, number>;

export type UserMetrics = {
	userId: string;
	metrics: MetricSnapshot;
};

export type AchievementRule = Pick<
	Achievement,
	"key" | "family" | "tier" | "metric" | "comparator" | "threshold"
>;

export type AchievementProgress = {
	value: number;
	target: number;
	/** Clamped to 0–1. */
	ratio: number;
};

export type AchievementUnlock = {
	key: string;
	metricValue: number;
};

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
	/** In the order the student chose. */
	pinned: AchievementView[];
};

export type UnlockedAchievement = Pick<
	Achievement,
	"key" | "name" | "description" | "icon" | "accent" | "shape" | "tier"
>;

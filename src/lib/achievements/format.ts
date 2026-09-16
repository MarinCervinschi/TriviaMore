import type { AchievementMetric } from "./types";

/**
 * A metric as a reader sees it. Only the time metric needs it: a raw column
 * reaching the interface shows as "7200000", and `formatTimeSpent` is no better
 * on a threshold — it spells ten hours as "10h 0m 0s", seconds and all.
 */
export function formatMetricValue(metric: AchievementMetric, value: number): string {
	if (metric !== "TOTAL_TIME_MS") return String(Math.floor(value));

	const minutes = Math.floor(value / 60_000);
	const hours = Math.floor(minutes / 60);
	if (hours === 0) return `${minutes}m`;
	const rest = minutes % 60;
	return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

import type {
	AchievementProgress,
	AchievementRule,
	AchievementUnlock,
	MetricSnapshot,
} from "./types";

export function meetsRule(rule: AchievementRule, snapshot: MetricSnapshot): boolean {
	const value = snapshot[rule.metric];
	return rule.comparator === "LTE" ? value <= rule.threshold : value >= rule.threshold;
}

/**
 * `null` wherever a bar would lie: a "lower is better" rule has no ramp, and one
 * pinned at 0% by a binary threshold reads as broken rather than as a goal.
 */
export function progressOf(
	rule: AchievementRule,
	snapshot: MetricSnapshot
): AchievementProgress | null {
	if (rule.comparator === "LTE" || rule.threshold <= 1) return null;

	const value = snapshot[rule.metric];
	return {
		value,
		target: rule.threshold,
		ratio: Math.min(1, Math.max(0, value / rule.threshold)),
	};
}

/**
 * The whole engine. Pure, so a replay over every user and a single unlock after
 * one quiz run the same code.
 */
export function evaluate(
	rules: AchievementRule[],
	snapshot: MetricSnapshot,
	awarded: ReadonlySet<string>
): AchievementUnlock[] {
	return rules
		.filter(rule => !awarded.has(rule.key) && meetsRule(rule, snapshot))
		.map(rule => ({ key: rule.key, metricValue: snapshot[rule.metric] }));
}

/**
 * Reaching tier III also satisfies I and II, so a first evaluation can unlock a
 * whole family at once. Only the top tier of each is worth a notification; the
 * others are already visible on the page.
 */
export function notifiableUnlocks(
	unlocks: AchievementUnlock[],
	rules: AchievementRule[]
): AchievementUnlock[] {
	const byKey = new Map(rules.map(rule => [rule.key, rule]));
	const topTier = new Map<string, AchievementUnlock>();

	for (const unlock of unlocks) {
		const rule = byKey.get(unlock.key);
		if (!rule) continue;
		const held = topTier.get(rule.family);
		const heldTier = held ? (byKey.get(held.key)?.tier ?? 0) : -1;
		if (rule.tier > heldTier) topTier.set(rule.family, unlock);
	}

	return [...topTier.values()];
}

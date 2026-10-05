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

/** `null` for a "lower is better" rule and for a binary threshold, which have no bar. */
export function progressOf(
	rule: AchievementRule,
	snapshot: MetricSnapshot
): AchievementProgress | null {
	if (rule.comparator === "LTE" || rule.threshold <= 1) return null;

	// MAX_SECTION_IMPROVEMENT is a delta and can go negative.
	const value = Math.max(0, snapshot[rule.metric]);
	return {
		value,
		target: rule.threshold,
		ratio: Math.min(1, value / rule.threshold),
	};
}

export function evaluate(
	rules: AchievementRule[],
	snapshot: MetricSnapshot,
	awarded: ReadonlySet<string>
): AchievementUnlock[] {
	return rules
		.filter(rule => !awarded.has(rule.key) && meetsRule(rule, snapshot))
		.map(rule => ({ key: rule.key, metricValue: snapshot[rule.metric] }));
}

/** Keeps only the top tier of each family, since one evaluation can unlock several. */
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

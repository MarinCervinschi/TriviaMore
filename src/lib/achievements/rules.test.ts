import { describe, expect, it } from "vitest";

import { evaluate, meetsRule, notifiableUnlocks, progressOf } from "./rules";
import type { AchievementRule, MetricSnapshot } from "./types";

function snapshot(overrides: Partial<MetricSnapshot> = {}): MetricSnapshot {
	return {
		QUIZZES_COMPLETED: 0,
		DISTINCT_SECTIONS: 0,
		DISTINCT_CLASSES: 0,
		DISTINCT_DEPARTMENTS: 0,
		PERFECT_QUIZZES: 0,
		HARD_CORRECT: 0,
		EXAM_SIMS_PASSED: 0,
		MAX_SECTION_IMPROVEMENT: 0,
		ACTIVE_WEEKS: 0,
		BEST_DAY_STREAK: 0,
		TOTAL_TIME_MS: 0,
		FLASHCARD_SESSIONS: 0,
		BOOKMARKED_THEN_CORRECT: 0,
		APPROVED_REQUESTS: 0,
		SIGNUP_RANK: 0,
		ENROLLMENT_DECLARED: 0,
		...overrides,
	};
}

function rule(overrides: Partial<AchievementRule> = {}): AchievementRule {
	return {
		key: "explorer_1",
		family: "explorer",
		tier: 1,
		metric: "DISTINCT_SECTIONS",
		comparator: "GTE",
		threshold: 3,
		...overrides,
	};
}

describe("meetsRule", () => {
	it("unlocks a GTE rule at the threshold, not one short of it", () => {
		expect(meetsRule(rule(), snapshot({ DISTINCT_SECTIONS: 3 }))).toBe(true);
		expect(meetsRule(rule(), snapshot({ DISTINCT_SECTIONS: 2 }))).toBe(false);
	});

	it("reads a LTE rule the other way round", () => {
		const founder = rule({
			metric: "SIGNUP_RANK",
			comparator: "LTE",
			threshold: 100,
		});
		expect(meetsRule(founder, snapshot({ SIGNUP_RANK: 100 }))).toBe(true);
		expect(meetsRule(founder, snapshot({ SIGNUP_RANK: 101 }))).toBe(false);
	});
});

describe("progressOf", () => {
	it("reports the ramp towards a tiered rule", () => {
		expect(
			progressOf(rule({ threshold: 25 }), snapshot({ DISTINCT_SECTIONS: 14 }))
		).toEqual({ value: 14, target: 25, ratio: 14 / 25 });
	});

	it("clamps past the threshold rather than reporting over 100%", () => {
		const progress = progressOf(
			rule({ threshold: 10 }),
			snapshot({ DISTINCT_SECTIONS: 40 })
		);
		expect(progress?.ratio).toBe(1);
	});

	it('floors a negative metric at zero, so no tile reads "-4 di 6"', () => {
		expect(
			progressOf(
				rule({ metric: "MAX_SECTION_IMPROVEMENT", threshold: 6 }),
				snapshot({ MAX_SECTION_IMPROVEMENT: -4 })
			)
		).toEqual({ value: 0, target: 6, ratio: 0 });
	});

	it("has no bar for a binary rule", () => {
		expect(
			progressOf(rule({ metric: "PERFECT_QUIZZES", threshold: 1 }), snapshot())
		).toBeNull();
	});

	it("has no bar for a LTE rule, which has no ramp to climb", () => {
		expect(
			progressOf(
				rule({ metric: "SIGNUP_RANK", comparator: "LTE", threshold: 100 }),
				snapshot({ SIGNUP_RANK: 4 })
			)
		).toBeNull();
	});
});

describe("evaluate", () => {
	const catalogue = [
		rule({ key: "explorer_1", tier: 1, threshold: 3 }),
		rule({ key: "explorer_2", tier: 2, threshold: 10 }),
		rule({ key: "explorer_3", tier: 3, threshold: 25 }),
		rule({
			key: "contributor_1",
			family: "contributor",
			metric: "APPROVED_REQUESTS",
			threshold: 1,
		}),
	];

	it("awards every tier the snapshot has passed, not just the top one", () => {
		const unlocks = evaluate(catalogue, snapshot({ DISTINCT_SECTIONS: 12 }), new Set());
		expect(unlocks.map(unlock => unlock.key)).toEqual(["explorer_1", "explorer_2"]);
	});

	it("records the metric value at the unlock", () => {
		const [unlock] = evaluate(
			catalogue,
			snapshot({ DISTINCT_SECTIONS: 12 }),
			new Set()
		);
		expect(unlock?.metricValue).toBe(12);
	});

	it("never re-awards what the user already holds", () => {
		const unlocks = evaluate(
			catalogue,
			snapshot({ DISTINCT_SECTIONS: 12 }),
			new Set(["explorer_1"])
		);
		expect(unlocks.map(unlock => unlock.key)).toEqual(["explorer_2"]);
	});

	it("awards nothing to an empty snapshot", () => {
		expect(evaluate(catalogue, snapshot(), new Set())).toEqual([]);
	});
});

describe("notifiableUnlocks", () => {
	const catalogue = [
		rule({ key: "explorer_1", tier: 1, threshold: 3 }),
		rule({ key: "explorer_2", tier: 2, threshold: 10 }),
		rule({
			key: "contributor_1",
			family: "contributor",
			metric: "APPROVED_REQUESTS",
			threshold: 1,
		}),
	];

	it("announces one unlock per family, the highest tier reached", () => {
		const unlocks = evaluate(
			catalogue,
			snapshot({ DISTINCT_SECTIONS: 12, APPROVED_REQUESTS: 1 }),
			new Set()
		);
		expect(
			notifiableUnlocks(unlocks, catalogue)
				.map(u => u.key)
				.sort()
		).toEqual(["contributor_1", "explorer_2"]);
	});
});

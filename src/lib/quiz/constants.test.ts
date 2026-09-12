import { describe, expect, it } from "vitest";

import {
	ABANDONED_ATTEMPT_TTL_MS,
	TIME_STEPS,
	abandonedAttemptCutoff,
} from "./constants";

describe("abandonedAttemptCutoff", () => {
	it("is exactly one horizon behind the instant it is given", () => {
		const now = Date.parse("2026-09-12T12:00:00.000Z");
		expect(abandonedAttemptCutoff(now)).toBe(
			new Date(now - ABANDONED_ATTEMPT_TTL_MS).toISOString()
		);
	});

	it("reads as UTC, which is what the timestamptz comparison needs", () => {
		expect(abandonedAttemptCutoff(Date.now())).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
		);
	});

	// Reaping an attempt still being taken would lose a real quiz, so a new and
	// longer time-limit option has to move the horizon with it.
	it("outlasts the longest quiz anyone can start, with room to spare", () => {
		const longestQuizMs = Math.max(...TIME_STEPS) * 60 * 1000;
		expect(ABANDONED_ATTEMPT_TTL_MS).toBeGreaterThan(longestQuizMs * 4);
	});
});

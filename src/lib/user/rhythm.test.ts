import { describe, expect, it } from "vitest";

import { computeStudyRhythm } from "./rhythm";

// Local Aug 24 2026, noon — dates are built from local components too, so the
// round-trip through ISO is timezone-stable.
const TODAY = new Date(2026, 7, 24, 12, 0, 0);

function iso(day: number, hour = 12): string {
	return new Date(2026, 7, day, hour).toISOString();
}

describe("computeStudyRhythm", () => {
	it("counts a streak of consecutive days ending today", () => {
		const r = computeStudyRhythm(
			[24, 23, 22].map(d => ({ completedAt: iso(d), score: 20 })),
			TODAY
		);
		expect(r.currentStreak).toBe(3);
	});

	it("keeps the streak alive when today has no run yet", () => {
		const r = computeStudyRhythm(
			[23, 22].map(d => ({ completedAt: iso(d), score: 20 })),
			TODAY
		);
		expect(r.currentStreak).toBe(2);
	});

	it("breaks the current streak after a full missed day", () => {
		const r = computeStudyRhythm(
			[22, 21].map(d => ({ completedAt: iso(d), score: 20 })),
			TODAY
		);
		expect(r.currentStreak).toBe(0);
	});

	it("finds the longest run across gaps", () => {
		const r = computeStudyRhythm(
			[24, 23, 22, 20].map(d => ({ completedAt: iso(d), score: 20 })),
			TODAY
		);
		expect(r.longestStreak).toBe(3);
		expect(r.activeDays).toBe(4);
	});

	it("distributes completions by local hour and finds the peak", () => {
		const r = computeStudyRhythm(
			[
				{ completedAt: iso(24, 14), score: 20 },
				{ completedAt: iso(23, 14), score: 20 },
				{ completedAt: iso(22, 9), score: 20 },
			],
			TODAY
		);
		expect(r.byHour[14]).toBe(2);
		expect(r.byHour[9]).toBe(1);
		expect(r.peakHour).toBe(14);
	});

	it("reports consistency and flags a thin sample", () => {
		const three = computeStudyRhythm(
			[
				{ completedAt: iso(24), score: 30 },
				{ completedAt: iso(23), score: 20 },
				{ completedAt: iso(22), score: 10 },
			],
			TODAY
		);
		expect(three.consistency.mean).toBe(20);
		expect(three.consistency.stdev).toBeCloseTo(Math.sqrt(200 / 3), 5);
		expect(three.consistency.thin).toBe(false);

		const two = computeStudyRhythm(
			[
				{ completedAt: iso(24), score: 30 },
				{ completedAt: iso(23), score: 20 },
			],
			TODAY
		);
		expect(two.consistency.thin).toBe(true);
	});

	it("is empty-safe", () => {
		const r = computeStudyRhythm([], TODAY);
		expect(r.currentStreak).toBe(0);
		expect(r.peakHour).toBeNull();
		expect(r.consistency).toEqual({ mean: 0, stdev: 0, count: 0, thin: true });
	});
});

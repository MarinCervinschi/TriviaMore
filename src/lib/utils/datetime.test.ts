import { describe, expect, it } from "vitest";

import { localDayIndex, localHour } from "./datetime";

describe("localDayIndex", () => {
	it("gives consecutive days consecutive integers", () => {
		const a = localDayIndex(new Date(2026, 7, 24, 23, 59));
		const b = localDayIndex(new Date(2026, 7, 25, 0, 1));
		expect(b - a).toBe(1);
	});

	it("is the same index all day long", () => {
		const early = localDayIndex(new Date(2026, 7, 24, 0, 0));
		const late = localDayIndex(new Date(2026, 7, 24, 23, 59));
		expect(early).toBe(late);
	});

	it("still counts one day across a DST change", () => {
		// Europe/Rome springs forward on 2026-03-29; a naive timestamp division
		// would report 0.958 of a day here and floor to the same index.
		const before = localDayIndex(new Date(2026, 2, 28, 12));
		const after = localDayIndex(new Date(2026, 2, 29, 12));
		expect(after - before).toBe(1);
	});

	it("accepts a string or a number", () => {
		const date = new Date(2026, 7, 24, 12);
		expect(localDayIndex(date.toISOString())).toBe(localDayIndex(date));
		expect(localDayIndex(date.getTime())).toBe(localDayIndex(date));
	});
});

describe("localHour", () => {
	it("reads the hour of the local day", () => {
		expect(localHour(new Date(2026, 7, 24, 21, 30))).toBe(21);
		expect(localHour(new Date(2026, 7, 24, 0, 5))).toBe(0);
	});
});

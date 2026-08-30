import { describe, expect, it } from "vitest";

import { MAX_SESSION_ITEMS, sessionCap, sessionHint } from "./session";

describe("sessionCap", () => {
	it("offers everything when there is less than the ceiling", () => {
		expect(sessionCap(12)).toBe(12);
		expect(sessionCap(MAX_SESSION_ITEMS)).toBe(MAX_SESSION_ITEMS);
	});

	it("stops at the ceiling the schemas enforce", () => {
		expect(sessionCap(150)).toBe(MAX_SESSION_ITEMS);
		expect(sessionCap(4000)).toBe(MAX_SESSION_ITEMS);
	});

	it("never offers zero, so the slider always has a value to sit on", () => {
		expect(sessionCap(0)).toBe(1);
	});
});

describe("sessionHint", () => {
	it("says all only when the count really is everything", () => {
		expect(sessionHint(12, 12, 12)).toBe("Tutte (12)");
	});

	it("does not claim all while it is showing the ceiling", () => {
		expect(sessionHint(100, 100, 150)).toBe("100 di 150 · massimo");
	});

	it("counts against what exists, not against the ceiling", () => {
		expect(sessionHint(30, 100, 150)).toBe("30 di 150");
	});
});

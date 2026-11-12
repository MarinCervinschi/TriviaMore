import { describe, expect, it } from "vitest";

import { createLogIntake } from "./intake";

const LIMITS = {
	batchesPerIp: 3,
	bytesPerIp: 1_000,
	batchesTotal: 5,
	bytesTotal: 2_500,
};

describe("createLogIntake", () => {
	it("refuses an IP past its batch budget", () => {
		const admit = createLogIntake(LIMITS);
		expect([1, 2, 3, 4].map(() => admit("a", 10, 0))).toEqual([
			true,
			true,
			true,
			false,
		]);
		expect(admit("b", 10, 0)).toBe(true);
	});

	it("refuses an IP past its byte budget", () => {
		const admit = createLogIntake(LIMITS);
		expect(admit("a", 900, 0)).toBe(true);
		expect(admit("a", 200, 0)).toBe(false);
	});

	it("refuses every IP once the global budget is spent", () => {
		const admit = createLogIntake(LIMITS);
		for (const ip of ["a", "b", "c", "d", "e"]) expect(admit(ip, 10, 0)).toBe(true);
		expect(admit("f", 10, 0)).toBe(false);
	});

	it("refuses every IP once the global bytes are spent", () => {
		const admit = createLogIntake(LIMITS);
		expect(admit("a", 1_000, 0)).toBe(true);
		expect(admit("b", 1_000, 0)).toBe(true);
		expect(admit("c", 1_000, 0)).toBe(false);
	});

	it("starts over after a minute", () => {
		const admit = createLogIntake(LIMITS);
		for (let i = 0; i < 4; i++) admit("a", 10, 0);
		expect(admit("a", 10, 60_000)).toBe(true);
	});
});

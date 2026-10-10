import { describe, expect, it } from "vitest";

import { buildRule, parseRule } from "./recurrence";

describe("recurrence", () => {
	it("repeats weekly on the weekday of the first day", () => {
		// 13 January 2027 is a Wednesday.
		expect(buildRule("weekly", "2027-01-13")).toBe("FREQ=WEEKLY;BYDAY=WE");
		expect(buildRule("biweekly", "2027-01-13", "2027-03-31")).toBe(
			"FREQ=WEEKLY;INTERVAL=2;BYDAY=WE;UNTIL=20270331"
		);
		expect(buildRule("none", "2027-01-13")).toBeNull();
	});

	it("reads back the preset and the end it was built from", () => {
		for (const preset of [
			"daily",
			"weekly",
			"biweekly",
			"monthly",
			"weekdays",
		] as const) {
			expect(parseRule(buildRule(preset, "2027-01-13", "2027-06-30"))).toEqual({
				preset,
				until: "2027-06-30",
			});
		}
		expect(parseRule(null)).toEqual({ preset: "none", until: "" });
	});
});

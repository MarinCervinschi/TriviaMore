import { describe, expect, it } from "vitest";

import { formatTimeSpent } from "./quiz-results";

describe("formatTimeSpent", () => {
	it("shows only seconds under a minute", () => {
		expect(formatTimeSpent(5000)).toBe("5s");
		expect(formatTimeSpent(500)).toBe("0s");
	});

	it("shows minutes and seconds under an hour", () => {
		expect(formatTimeSpent(65_000)).toBe("1m 5s");
	});

	it("shows hours, minutes and seconds past an hour", () => {
		expect(formatTimeSpent(3_665_000)).toBe("1h 1m 5s");
	});
});

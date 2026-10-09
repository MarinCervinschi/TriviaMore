import { describe, expect, it } from "vitest";

import { addDays, daysBetween, examSessions, sessionOn } from "./calendar-model";

describe("dates", () => {
	it("crosses a DST change by whole days", () => {
		expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
		expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
	});

	it("counts the days between two dates across a DST change", () => {
		expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
		expect(daysBetween("2026-10-26", "2026-10-24")).toBe(-2);
	});
});

describe("sessions", () => {
	it("ends the winter session on the last day of February", () => {
		expect(examSessions(2028)[0]!.end).toBe("2028-02-29");
		expect(examSessions(2027)[0]!.end).toBe("2027-02-28");
	});

	it("finds the session a day falls in, inclusive at both ends", () => {
		expect(sessionOn("2026-06-01")?.key).toBe("summer");
		expect(sessionOn("2026-07-31")?.key).toBe("summer");
		expect(sessionOn("2026-08-01")).toBeUndefined();
	});
});

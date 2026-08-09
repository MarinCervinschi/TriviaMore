import { describe, expect, it } from "vitest";

import {
	formatDate,
	formatDateLong,
	formatDateTime,
	formatDayMonth,
	formatNumber,
	formatTime,
} from "./format";

// A fixed instant, so the assertions do not drift with the clock. Times are
// asserted loosely because the runner's zone is not the reader's.
const AUG_2026 = new Date("2026-08-09T14:30:00Z");
const DEC_2025 = new Date("2025-12-02T09:00:00Z");

describe("formatDate", () => {
	it("renders the Italian numeric form", () => {
		expect(formatDate(AUG_2026)).toBe("09/08/2026");
	});

	it("accepts an ISO string as well as a Date", () => {
		expect(formatDate("2026-08-09T14:30:00Z")).toBe(formatDate(AUG_2026));
	});
});

describe("formatDateLong", () => {
	it("spells the month out", () => {
		expect(formatDateLong(AUG_2026)).toBe("9 agosto 2026");
	});
});

describe("formatTime", () => {
	it("renders 24-hour, zero-padded", () => {
		expect(formatTime(AUG_2026)).toMatch(/^\d{2}:\d{2}$/);
	});
});

describe("formatDateTime", () => {
	it("appends the time to the long date", () => {
		expect(formatDateTime(AUG_2026)).toMatch(/^9 agosto 2026, \d{2}:\d{2}$/);
	});
});

describe("formatDayMonth", () => {
	it("omits the year within the reference year", () => {
		expect(formatDayMonth(AUG_2026, AUG_2026)).toBe("9 ago");
	});

	it("keeps the year when it differs, where dropping it would mislead", () => {
		expect(formatDayMonth(DEC_2025, AUG_2026)).toBe("2 dic 2025");
	});
});

describe("formatNumber", () => {
	// Italian groups from five digits up, so 1240 stays unseparated while 12400
	// does not. Pinned because it looks like a bug the first time you meet it.
	it("leaves four-digit numbers unseparated", () => {
		expect(formatNumber(1240)).toBe("1240");
	});

	it("separates from five digits up", () => {
		expect(formatNumber(12400)).toBe("12.400");
		expect(formatNumber(1240000)).toBe("1.240.000");
	});

	it("leaves small numbers alone", () => {
		expect(formatNumber(42)).toBe("42");
	});
});

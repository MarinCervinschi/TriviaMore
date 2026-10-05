import { describe, expect, it } from "vitest";

import { academicYearOf, formatAcademicYear } from "@/lib/catalog/academic-year";

describe("academicYearOf", () => {
	it("is the calendar year from August on", () => {
		expect(academicYearOf(new Date("2026-08-01T00:00:00Z"))).toBe(2026);
		expect(academicYearOf(new Date("2026-10-05T12:00:00Z"))).toBe(2026);
	});

	it("is the previous year before August", () => {
		expect(academicYearOf(new Date("2026-07-31T23:59:59Z"))).toBe(2025);
		expect(academicYearOf(new Date("2027-01-15T00:00:00Z"))).toBe(2026);
	});
});

describe("formatAcademicYear", () => {
	it("pairs the year with the next one's last two digits", () => {
		expect(formatAcademicYear(2026)).toBe("2026/27");
		expect(formatAcademicYear(1999)).toBe("1999/00");
	});
});

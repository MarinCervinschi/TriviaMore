/** The academic year a date falls in, by its first calendar year; it turns over on 1 August, UTC. */
export function academicYearOf(date: Date): number {
	return date.getUTCMonth() >= 7 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
}

export function formatAcademicYear(year: number): string {
	return `${year}/${String((year + 1) % 100).padStart(2, "0")}`;
}

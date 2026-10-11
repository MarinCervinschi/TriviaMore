// The viewer's timezone throughout, so nothing derived here may render during SSR; gate it on `useIsHydrated()`.

type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
	return value instanceof Date ? value : new Date(value);
}

/** Built from the local Y/M/D, so consecutive days differ by exactly 1 across DST. */
export function localDayIndex(value: DateInput): number {
	const date = toDate(value);
	return Math.floor(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
	);
}

/** Hour of the local day, 0–23. */
export function localHour(value: DateInput): number {
	return toDate(value).getHours();
}

/** A "yyyy-MM-dd" day as local midnight. */
export function parseIsoDay(iso: string): Date {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year!, month! - 1, day);
}

/** The local day of a date as "yyyy-MM-dd". */
export function toIsoDay(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

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

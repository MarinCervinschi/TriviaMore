/**
 * Date arithmetic in the **viewer's** timezone, declared once.
 *
 * `format.ts` turns an instant into a string; this turns instants into the units
 * a study calendar is read in — which day, which hour, how many days apart.
 *
 * Every function here reads the host timezone, so on the server it answers for
 * the container (UTC) and in the browser for the reader (UTC+1/+2). Anything
 * derived from them therefore **must not be rendered during SSR**: the two
 * answers differ and React cannot patch the difference. Gate the component on
 * `useIsHydrated()` — an hour-of-day histogram rendered server-side is off by
 * the whole offset, which is how this was found.
 */

type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
	return value instanceof Date ? value : new Date(value);
}

/**
 * A calendar day as a stable integer. Built from the local Y/M/D so consecutive
 * days differ by exactly 1 and a DST change never shifts a boundary — which
 * subtracting raw timestamps would.
 */
export function localDayIndex(value: DateInput): number {
	const date = toDate(value);
	return Math.floor(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
	);
}

/** Whole calendar days from `from` to `to`, ignoring the time of day. */
/** Hour of the local day, 0–23. */
export function localHour(value: DateInput): number {
	return toDate(value).getHours();
}

/**
 * The app's date and number formats, declared once.
 *
 * These were spelled out at 25 call sites across routes, charts and components,
 * in four recurring shapes — and one of them had lost its locale entirely, so
 * the same figure rendered as `1.240` or `1,240` depending on the reader's
 * browser. The locale is a product decision, not a per-call-site one.
 */

const LOCALE = "it-IT";

type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
	return value instanceof Date ? value : new Date(value);
}

/** `09/08/2026` — for tables and dense rows, where width matters. */
export function formatDate(value: DateInput): string {
	return toDate(value).toLocaleDateString(LOCALE);
}

/** `9 agosto 2026` — for prose and detail pages, where the date is read once. */
export function formatDateLong(value: DateInput): string {
	return toDate(value).toLocaleDateString(LOCALE, {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

/** `16:30`. */
export function formatTime(value: DateInput): string {
	return toDate(value).toLocaleTimeString(LOCALE, {
		hour: "2-digit",
		minute: "2-digit",
	});
}

/** `9 agosto 2026, 16:30` — when the time of day is part of the information. */
export function formatDateTime(value: DateInput): string {
	const date = toDate(value);
	return `${formatDateLong(date)}, ${formatTime(date)}`;
}

/**
 * `9 ago`, or `9 ago 2025` when the date is not in `reference`'s year — a year
 * that is obviously the current one is noise, and one that is not is essential.
 */
export function formatDayMonth(value: DateInput, reference: DateInput): string {
	const date = toDate(value);
	const sameYear = date.getFullYear() === toDate(reference).getFullYear();
	return date.toLocaleDateString(LOCALE, {
		day: "numeric",
		month: "short",
		...(sameYear ? {} : { year: "numeric" }),
	});
}

/**
 * `12.400`, but `1240` — Italian groups only from five digits up, so a
 * four-digit number is deliberately left unseparated. That is CLDR's rule, not
 * an oversight; forcing `useGrouping: "always"` would override it.
 */
export function formatNumber(value: number): string {
	return value.toLocaleString(LOCALE);
}

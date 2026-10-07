// A fixed time zone, so the server and the browser render the same string and hydration holds.
const DATE_TIME = new Intl.DateTimeFormat("it-IT", {
	timeZone: "Europe/Rome",
	day: "numeric",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

const NUMBER = new Intl.NumberFormat("it-IT");
const PERCENT = new Intl.NumberFormat("it-IT", {
	style: "percent",
	maximumFractionDigits: 0,
});

export const formatDateTime = (iso: string | null) =>
	iso ? DATE_TIME.format(new Date(iso)) : "—";

export const formatNumber = (value: number) => NUMBER.format(value);

export const formatPercent = (share: number | null) =>
	share === null ? "—" : PERCENT.format(share);

/** `1 min 30 s`, `45 s`, `—` while the end is unknown. */
export function formatDuration(startIso: string | null, endIso: string | null): string {
	if (!startIso || !endIso) return "—";
	const seconds = Math.max(
		0,
		Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000)
	);
	const minutes = Math.floor(seconds / 60);
	return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}

/** `tra 5 min`, `tra 3 h`, `tra 2 g`, measured from `nowIso` so the server and the browser agree. */
export function formatRelativeFuture(nowIso: string, atIso: string): string {
	const minutes = Math.max(
		0,
		Math.round((Date.parse(atIso) - Date.parse(nowIso)) / 60_000)
	);
	if (minutes < 60) return `tra ${minutes} min`;
	const hours = Math.round(minutes / 60);
	if (hours < 48) return `tra ${hours} h`;
	return `tra ${Math.round(hours / 24)} g`;
}

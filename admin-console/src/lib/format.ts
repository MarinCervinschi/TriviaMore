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

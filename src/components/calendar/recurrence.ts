export type RepeatPreset =
	| "none"
	| "daily"
	| "weekly"
	| "biweekly"
	| "monthly"
	| "weekdays";

export const REPEAT_LABELS: Record<RepeatPreset, string> = {
	none: "Non si ripete",
	daily: "Ogni giorno",
	weekly: "Ogni settimana",
	biweekly: "Ogni due settimane",
	monthly: "Ogni mese",
	weekdays: "Dal lunedì al venerdì",
};

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const weekdayOf = (iso: string) => {
	const [year, month, day] = iso.split("-").map(Number);
	return BYDAY[new Date(Date.UTC(year!, month! - 1, day)).getUTCDay()]!;
};

/** The RFC 5545 rule for a preset, from the event's first day; `until` is inclusive. */
export function buildRule(
	preset: RepeatPreset,
	date: string,
	until?: string
): string | null {
	const base = {
		none: null,
		daily: "FREQ=DAILY",
		weekly: `FREQ=WEEKLY;BYDAY=${weekdayOf(date)}`,
		biweekly: `FREQ=WEEKLY;INTERVAL=2;BYDAY=${weekdayOf(date)}`,
		monthly: "FREQ=MONTHLY",
		weekdays: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
	}[preset];
	if (!base) return null;
	return until ? `${base};UNTIL=${until.replaceAll("-", "")}` : base;
}

/** The preset and end a stored rule came from; a rule we did not write reads as weekly. */
export function parseRule(rule: string | null | undefined): {
	preset: RepeatPreset;
	until: string;
} {
	if (!rule) return { preset: "none", until: "" };
	const parts = Object.fromEntries(
		rule.split(";").map(part => part.split("=") as [string, string])
	);
	const raw = parts.UNTIL ?? "";
	const until =
		raw.length >= 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : "";
	if (parts.FREQ === "DAILY") return { preset: "daily", until };
	if (parts.FREQ === "MONTHLY") return { preset: "monthly", until };
	if (parts.FREQ === "WEEKLY" && parts.BYDAY === "MO,TU,WE,TH,FR") {
		return { preset: "weekdays", until };
	}
	if (parts.FREQ === "WEEKLY" && parts.INTERVAL === "2")
		return { preset: "biweekly", until };
	return { preset: "weekly", until };
}

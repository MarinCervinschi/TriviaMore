import type { EntryColor } from "@/lib/crm/schemas";

export type Importance = 1 | 2 | 3;

/** The kinds the calendar can draw; each one is described once, in `ENTRY_KINDS`. */
export type EntryKind = "sitting" | "event" | "task";

/** One thing on a day. Days are ISO dates, never instants; times are a local "HH:MM". */
export type CalendarEntry = {
	id: string;
	kind: EntryKind;
	date: string;
	/** Inclusive, for an entry that spans several days. */
	endDate?: string;
	time?: string;
	/** Exclusive; an hour after `time` when it is missing. */
	endTime?: string;
	/** An RFC 5545 rule, without the "RRULE:" prefix. */
	recurrence?: string;
	title: string;
	detail?: string;
	/** Drawn solid: the appello the student means to take, for one. */
	primary?: boolean;
	/** 1 to 3, for the kinds that grade their entries. */
	level?: Importance;
	done?: boolean;
	/** The colour the user picked, over the kind's own. */
	color?: EntryColor;
};

/** Where an entry sits: the days it covers and, when timed, its hours. */
export type EntrySpan = {
	date: string;
	endDate?: string;
	time?: string;
	endTime?: string;
};

/** The order of the kinds in the sidebar filters. */
export const KIND_ORDER: Record<EntryKind, number> = { sitting: 0, event: 1, task: 2 };

export type ExamSession = {
	key: "winter" | "summer" | "autumn";
	label: string;
	start: string;
	end: string;
};

const DAY_MS = 86_400_000;

const pad = (value: number) => String(value).padStart(2, "0");

export const isoDay = (year: number, month: number, day: number) =>
	`${year}-${pad(month + 1)}-${pad(day)}`;

const toUtc = (iso: string) => {
	const [year, month, day] = iso.split("-").map(Number);
	return Date.UTC(year!, month! - 1, day);
};

const fromUtc = (ms: number) => {
	const date = new Date(ms);
	return isoDay(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const addDays = (iso: string, days: number) =>
	fromUtc(toUtc(iso) + days * DAY_MS);

export const daysBetween = (from: string, to: string) =>
	Math.round((toUtc(to) - toUtc(from)) / DAY_MS);

/** The three sessions of a calendar year, approximate: departments move them by a week or two. */
export function examSessions(year: number): ExamSession[] {
	return [
		{
			key: "winter",
			label: "Sessione invernale",
			start: isoDay(year, 0, 7),
			end: fromUtc(Date.UTC(year, 2, 0)),
		},
		{
			key: "summer",
			label: "Sessione estiva",
			start: isoDay(year, 5, 1),
			end: isoDay(year, 6, 31),
		},
		{
			key: "autumn",
			label: "Sessione autunnale",
			start: isoDay(year, 8, 1),
			end: isoDay(year, 8, 30),
		},
	];
}

export function sessionOn(iso: string): ExamSession | undefined {
	const year = Number(iso.slice(0, 4));
	return examSessions(year).find(
		session =>
			daysBetween(session.start, iso) >= 0 && daysBetween(iso, session.end) >= 0
	);
}

const dayTitle = new Intl.DateTimeFormat("it-IT", {
	weekday: "long",
	day: "numeric",
	month: "long",
	timeZone: "UTC",
});

export const formatDay = (iso: string) => dayTitle.format(new Date(toUtc(iso)));

export const IMPORTANCE_LABEL: Record<Importance, string> = {
	1: "Bassa",
	2: "Media",
	3: "Alta",
};

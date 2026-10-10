import { addDays, addMinutes, format } from "date-fns";

import { expandRecurrence } from "@/components/event-calendar/event-calendar-recurrence";
import type {
	CalendarEvent,
	EventCalendarProposedUpdate,
} from "@/components/event-calendar/event-calendar-types";

import { ENTRY_KINDS } from "./calendar-entry";
import {
	type CalendarEntry,
	type EntrySpan,
	addDays as addIsoDays,
} from "./calendar-model";

const localDay = (iso: string) => {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year!, month! - 1, day);
};

const at = (iso: string, time: string) => {
	const [hours, minutes] = time.split(":").map(Number);
	const date = localDay(iso);
	date.setHours(hours!, minutes!, 0, 0);
	return date;
};

/** The mark of a checkable entry, as a toggle that neither drags nor opens the chip. */
function ChipCheck({
	entry,
	onToggle,
}: {
	entry: CalendarEntry;
	onToggle: () => void;
}) {
	return (
		<span
			className="hover:bg-foreground/10 -m-1 cursor-pointer rounded-full p-1"
			onPointerDown={event => event.stopPropagation()}
			onClick={event => {
				event.stopPropagation();
				onToggle();
			}}
		>
			{ENTRY_KINDS[entry.kind].mark(entry)}
		</span>
	);
}

/** Our entry as a ReUI event, with the entry itself riding along as `data`. */
export function toCalendarEvent(
	entry: CalendarEntry,
	onToggle?: (entry: CalendarEntry) => void
): CalendarEvent<CalendarEntry> {
	const kind = ENTRY_KINDS[entry.kind];
	const timed = Boolean(entry.time) && !kind.allDayOnly;
	const lastDay = entry.endDate ?? entry.date;
	const start = timed ? at(entry.date, entry.time!) : localDay(entry.date);
	const end = timed
		? entry.endTime
			? at(lastDay, entry.endTime)
			: addMinutes(at(lastDay, entry.time!), 60)
		: addDays(localDay(lastDay), 1);
	const movable = !entry.done && !entry.recurrence;
	return {
		id: entry.id,
		title: entry.detail ? `${entry.title} · ${entry.detail}` : entry.title,
		start,
		end,
		allDay: !timed,
		recurrence: entry.recurrence ? `RRULE:${entry.recurrence}` : undefined,
		color: kind.color(entry),
		icon:
			kind.checkable && onToggle ? (
				<ChipCheck entry={entry} onToggle={() => onToggle(entry)} />
			) : undefined,
		className: kind.checkable && entry.done ? "line-through opacity-60" : undefined,
		readOnly: !movable,
		resizable: movable && !kind.allDayOnly,
		priority: entry.primary ? 1 : 0,
		data: entry,
	};
}

const day = (date: Date) => format(date, "yyyy-MM-dd");

const viewerZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** The entry once per day it falls on between two days; a one-off entry is itself. */
export function occurrencesOf(
	entry: CalendarEntry,
	from: string,
	to: string
): CalendarEntry[] {
	if (!entry.recurrence) return [entry];
	return expandRecurrence(
		toCalendarEvent(entry),
		{ start: localDay(from), end: localDay(to) },
		{ timeZone: viewerZone() }
	).map(occurrence => ({ ...entry, date: day(occurrence.start) }));
}

/** The days of a month, with a week either side, that hold an entry, for the day picker. */
export function busyDays(entries: CalendarEntry[], month: Date): Date[] {
	const first = format(month, "yyyy-MM-01");
	const from = addIsoDays(first, -7);
	const to = addIsoDays(first, 45);
	const days = new Set<string>();
	for (const entry of entries) {
		for (const occurrence of occurrencesOf(entry, from, to)) {
			const last = occurrence.endDate ?? occurrence.date;
			for (let iso = occurrence.date; iso <= last; iso = addIsoDays(iso, 1))
				days.add(iso);
		}
	}
	return [...days].map(localDay);
}

/** What falls on one day, recurrences included: whole days first, then by hour. */
export function entriesOn(entries: CalendarEntry[], iso: string): CalendarEntry[] {
	return entries
		.flatMap(entry => occurrencesOf(entry, iso, addIsoDays(iso, 1)))
		.filter(entry => entry.date <= iso && iso <= (entry.endDate ?? entry.date))
		.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
}

/** The dot the day pickers draw under a busy day. */
export const BUSY_DOT =
	"relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-current after:opacity-60";

/** A timed stretch in days and local times; an end at midnight stays on its day as 23:59. */
export function timedSpan(start: Date, end: Date): EntrySpan {
	const date = day(start);
	const last = day(addMinutes(end, -1));
	const endTime = format(end, "HH:mm");
	return {
		date,
		endDate: last > date ? last : undefined,
		time: format(start, "HH:mm"),
		endTime: endTime === "00:00" ? "23:59" : endTime,
	};
}

/** Where a drag or a resize left the entry, back in days and local times. */
export function moveOf(update: EventCalendarProposedUpdate<CalendarEntry>): EntrySpan {
	const date = day(update.start);
	if (update.allDay) {
		const last = day(addDays(update.end, -1));
		return last > date ? { date, endDate: last } : { date };
	}
	return timedSpan(update.start, update.end);
}

/** An appello cannot land on an hour. */
export function canMove(update: EventCalendarProposedUpdate<CalendarEntry>): boolean {
	const entry = update.event.data;
	if (!entry) return false;
	return !(ENTRY_KINDS[entry.kind].allDayOnly && !update.allDay);
}

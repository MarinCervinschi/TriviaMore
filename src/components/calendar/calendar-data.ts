import type { CalendarData } from "@/lib/crm/types";

import type { CalendarEntry, Importance } from "./calendar-model";

export type EntryRef = { kind: "sitting" | "event" | "task"; id: string };

/** Entry ids carry their table, so an appello and an event never collide. */
export const refOf = (entry: CalendarEntry): EntryRef => {
	const [kind, id] = entry.id.split(":") as [EntryRef["kind"], string];
	return { kind, id };
};

export function toEntries(data: CalendarData): CalendarEntry[] {
	return [
		...data.sittings.map(
			(sitting): CalendarEntry => ({
				id: `sitting:${sitting.id}`,
				kind: "sitting",
				date: sitting.date,
				title: sitting.examName,
				detail: sitting.label ?? undefined,
				level: sitting.importance as Importance,
				primary: sitting.chosen,
				done: sitting.examPassed,
			})
		),
		...data.tasks.map(
			(task): CalendarEntry => ({
				id: `task:${task.id}`,
				kind: "task",
				date: task.dueDate,
				time: task.dueTime ?? undefined,
				endTime: task.endTime ?? undefined,
				title: task.title,
				detail: task.examName ?? undefined,
				done: task.done,
				color: task.color ?? undefined,
			})
		),
		...data.events.map(
			(event): CalendarEntry => ({
				id: `event:${event.id}`,
				kind: "event",
				date: event.date,
				endDate: event.endDate ?? undefined,
				time: event.startTime ?? undefined,
				endTime: event.endTime ?? undefined,
				title: event.title,
				detail: event.examName ?? undefined,
				recurrence: event.recurrence ?? undefined,
				color: event.color ?? undefined,
			})
		),
	];
}

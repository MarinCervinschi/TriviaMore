import {
	useCreateEvent,
	useCreateSitting,
	useCreateTask,
	useRemoveEvent,
	useRemoveSitting,
	useRemoveTask,
	useUpdateEvent,
	useUpdateSitting,
	useUpdateTask,
} from "@/lib/crm/mutations";
import type { CalendarData } from "@/lib/crm/types";

import type { EntryRef } from "./calendar-data";
import { type EventDraft, EventSheet } from "./event-sheet";
import type { QuickResult } from "./quick-create";
import { type SittingDraft, SittingSheet } from "./sitting-sheet";
import { type TaskDraft, TaskSheet } from "./task-sheet";

/** Which sheet is open: an entry to edit by id, or a new one with what is already known. */
export type SheetTarget =
	| { kind: "sitting"; id?: string; initial?: Partial<SittingDraft> }
	| { kind: "event"; id?: string; initial?: Partial<EventDraft> }
	| { kind: "task"; id?: string; initial?: Partial<TaskDraft> }
	| null;

export const sheetOf = (ref: EntryRef) =>
	({ kind: ref.kind, id: ref.id }) as SheetTarget;

/** What the quick create had, handed to the full sheet of its kind. */
export function sheetFromQuick(result: QuickResult): SheetTarget {
	if (result.kind === "task") {
		return {
			kind: "task",
			initial: {
				title: result.title,
				dueDate: result.draft.date,
				dueTime: result.draft.time ?? null,
				endTime: result.draft.time ? (result.draft.endTime ?? null) : null,
			},
		};
	}
	if (result.kind === "event") {
		return {
			kind: "event",
			initial: {
				title: result.title,
				date: result.draft.date,
				endDate: result.draft.endDate ?? null,
				startTime: result.draft.time ?? null,
				endTime: result.draft.endTime ?? null,
			},
		};
	}
	return {
		kind: "sitting",
		initial: { examId: result.examId, date: result.draft.date },
	};
}

/** The appello, event and task sheets, saving through the calendar mutations. */
export function CalendarSheets({
	data,
	open,
	onClose: close,
}: {
	data: CalendarData;
	open: SheetTarget;
	onClose: () => void;
}) {
	const createSitting = useCreateSitting();
	const updateSitting = useUpdateSitting("Appello salvato");
	const removeSitting = useRemoveSitting();
	const createEvent = useCreateEvent();
	const updateEvent = useUpdateEvent("Evento salvato");
	const removeEvent = useRemoveEvent();
	const createTask = useCreateTask();
	const updateTask = useUpdateTask("Task salvata");
	const removeTask = useRemoveTask();

	const openExams = data.exams.filter(exam => !exam.passed);
	const sitting =
		open?.kind === "sitting" && open.id
			? data.sittings.find(row => row.id === open.id)
			: undefined;
	const event =
		open?.kind === "event" && open.id
			? data.events.find(row => row.id === open.id)
			: undefined;
	const task =
		open?.kind === "task" && open.id
			? data.tasks.find(row => row.id === open.id)
			: undefined;

	return (
		<>
			<SittingSheet
				key={`sitting-${open?.kind === "sitting" ? (open.id ?? "new") : ""}`}
				open={open?.kind === "sitting"}
				editing={Boolean(sitting)}
				exams={sitting ? data.exams : openExams}
				initial={
					sitting
						? {
								examId: sitting.examId,
								date: sitting.date,
								label: sitting.label ?? "",
								importance: sitting.importance as 1 | 2 | 3,
								chosen: sitting.chosen,
							}
						: open?.kind === "sitting"
							? open.initial
							: undefined
				}
				pending={createSitting.isPending || updateSitting.isPending}
				onSubmit={draft => {
					const values = {
						date: draft.date,
						label: draft.label || null,
						importance: draft.importance,
						chosen: draft.chosen,
					};
					if (sitting)
						updateSitting.mutate({ id: sitting.id, ...values }, { onSuccess: close });
					else
						createSitting.mutate(
							{ examId: draft.examId, ...values },
							{ onSuccess: close }
						);
				}}
				onRemove={
					sitting
						? () => removeSitting.mutate(sitting.id, { onSuccess: close })
						: undefined
				}
				onClose={close}
			/>

			<EventSheet
				key={`event-${open?.kind === "event" ? (open.id ?? "new") : ""}`}
				open={open?.kind === "event"}
				editing={Boolean(event)}
				exams={data.exams}
				initial={
					event
						? {
								title: event.title,
								date: event.date,
								endDate: event.endDate,
								recurrence: event.recurrence,
								color: event.color,
								startTime: event.startTime,
								endTime: event.endTime,
								notes: event.notes ?? "",
								examId: event.examId,
							}
						: open?.kind === "event"
							? open.initial
							: undefined
				}
				pending={createEvent.isPending || updateEvent.isPending}
				onSubmit={draft => {
					const values = {
						title: draft.title,
						date: draft.date,
						endDate: draft.endDate,
						recurrence: draft.recurrence,
						color: draft.color,
						startTime: draft.startTime,
						endTime: draft.endTime,
						notes: draft.notes || null,
						examId: draft.examId,
					};
					if (event)
						updateEvent.mutate({ id: event.id, ...values }, { onSuccess: close });
					else createEvent.mutate(values, { onSuccess: close });
				}}
				onRemove={
					event ? () => removeEvent.mutate(event.id, { onSuccess: close }) : undefined
				}
				onClose={close}
			/>

			<TaskSheet
				key={`task-${open?.kind === "task" ? (open.id ?? "new") : ""}`}
				open={open?.kind === "task"}
				editing={Boolean(task)}
				exams={data.exams}
				initial={
					task
						? {
								title: task.title,
								notes: task.notes ?? "",
								dueDate: task.dueDate,
								dueTime: task.dueTime,
								endTime: task.endTime,
								done: task.done,
								color: task.color,
								examId: task.examId,
							}
						: open?.kind === "task"
							? open.initial
							: undefined
				}
				pending={createTask.isPending || updateTask.isPending}
				onSubmit={draft => {
					const values = { ...draft, notes: draft.notes || null };
					if (task) updateTask.mutate({ id: task.id, ...values }, { onSuccess: close });
					else createTask.mutate(values, { onSuccess: close });
				}}
				onRemove={
					task ? () => removeTask.mutate(task.id, { onSuccess: close }) : undefined
				}
				onClose={close}
			/>
		</>
	);
}

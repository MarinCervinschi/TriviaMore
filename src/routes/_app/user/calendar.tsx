import { useCallback, useEffect, useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

import { type EntryRef, refOf, toEntries } from "@/components/calendar/calendar-data";
import type { CalendarEntry, EntrySpan } from "@/components/calendar/calendar-model";
import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
import { type EventDraft, EventSheet } from "@/components/calendar/event-sheet";
import { QuickCreate, type QuickResult } from "@/components/calendar/quick-create";
import { type SittingDraft, SittingSheet } from "@/components/calendar/sitting-sheet";
import { type TaskDraft, TaskSheet } from "@/components/calendar/task-sheet";
import { readSidebarOpen } from "@/components/layout/sidebar-state";
import { CalendarSkeleton } from "@/components/skeletons";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsHydrated } from "@/hooks/useIsHydrated";
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
import { crmQueries } from "@/lib/crm/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/user/calendar")({
	loader: ({ context }) => context.queryClient.ensureQueryData(crmQueries.calendar()),
	head: () => seoHead({ title: "Calendario", noindex: true }),
	pendingComponent: CalendarSkeleton,
	component: CalendarPage,
});

type Open =
	| { kind: "sitting"; id?: string; initial?: Partial<SittingDraft> }
	| { kind: "event"; id?: string; initial?: Partial<EventDraft> }
	| { kind: "task"; id?: string; initial?: Partial<TaskDraft> }
	| null;

/** The calendar wants the width: the app sidebar folds on the way in, and the saved choice returns on the way out. */
function useFoldedAppSidebar() {
	const { setOpen } = useSidebar();
	useEffect(() => {
		setOpen(false, { persist: false });
		return () => setOpen(readSidebarOpen(), { persist: false });
	}, []);
}

function CalendarPage() {
	useFoldedAppSidebar();
	const { data } = useSuspenseQuery(crmQueries.calendar());
	const entries = useMemo(() => toEntries(data), [data]);
	const [open, setOpen] = useState<Open>(null);
	const close = () => setOpen(null);

	const createSitting = useCreateSitting();
	const updateSitting = useUpdateSitting("Appello salvato");
	const moveSitting = useUpdateSitting();
	const removeSitting = useRemoveSitting();
	const createEvent = useCreateEvent();
	const updateEvent = useUpdateEvent("Evento salvato");
	const moveEvent = useUpdateEvent();
	const removeEvent = useRemoveEvent();
	const createTask = useCreateTask();
	const updateTask = useUpdateTask("Task salvata");
	const quietTask = useUpdateTask();
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

	const openEntry = (ref: EntryRef) => setOpen({ kind: ref.kind, id: ref.id } as Open);

	const { mutate: patchTask } = quietTask;
	const toggleEntry = useCallback(
		(entry: CalendarEntry) => {
			const ref = refOf(entry);
			if (ref.kind === "task") patchTask({ id: ref.id, done: !entry.done });
		},
		[patchTask]
	);

	const hydrated = useIsHydrated();
	const [quick, setQuick] = useState<EntrySpan | null>(null);

	const saveQuick = (result: QuickResult) => {
		const done = { onSuccess: () => setQuick(null) };
		if (result.kind === "task") {
			createTask.mutate(
				{
					title: result.title,
					dueDate: result.draft.date,
					dueTime: result.draft.time ?? null,
					endTime: result.draft.time ? (result.draft.endTime ?? null) : null,
				},
				done
			);
		} else if (result.kind === "event") {
			createEvent.mutate(
				{
					title: result.title,
					date: result.draft.date,
					endDate: result.draft.endDate ?? null,
					startTime: result.draft.time ?? null,
					endTime: result.draft.endTime ?? null,
				},
				done
			);
		} else {
			createSitting.mutate(
				{
					examId: result.examId,
					date: result.draft.date,
					importance: 2,
					chosen: false,
				},
				done
			);
		}
	};

	const moreOptions = (result: QuickResult) => {
		setQuick(null);
		if (result.kind === "task") {
			setOpen({
				kind: "task",
				initial: {
					title: result.title,
					dueDate: result.draft.date,
					dueTime: result.draft.time ?? null,
					endTime: result.draft.time ? (result.draft.endTime ?? null) : null,
				},
			});
		} else if (result.kind === "event") {
			setOpen({
				kind: "event",
				initial: {
					title: result.title,
					date: result.draft.date,
					endDate: result.draft.endDate ?? null,
					startTime: result.draft.time ?? null,
					endTime: result.draft.endTime ?? null,
				},
			});
		} else {
			setOpen({
				kind: "sitting",
				initial: { examId: result.examId, date: result.draft.date },
			});
		}
	};

	if (!hydrated) return <CalendarSkeleton />;

	return (
		<div className="px-4 py-4 md:px-6">
			<CalendarWorkspace
				entries={entries}
				today={format(new Date(), "yyyy-MM-dd")}
				canAddSitting={openExams.length > 0}
				className="h-[calc(100dvh-var(--app-header-h)-3rem)] min-h-[36rem]"
				onSelectEntry={entry => openEntry(refOf(entry))}
				onCreate={setQuick}
				onCreateKind={kind => setOpen({ kind })}
				onToggleEntry={toggleEntry}
				onMoveEntry={(entry, move) => {
					const ref = refOf(entry);
					if (ref.kind === "sitting") {
						moveSitting.mutate({ id: ref.id, date: move.date });
					} else if (ref.kind === "task") {
						quietTask.mutate({
							id: ref.id,
							dueDate: move.date,
							dueTime: move.time ?? null,
							endTime: move.endDate ? null : (move.endTime ?? null),
						});
					} else {
						moveEvent.mutate({
							id: ref.id,
							date: move.date,
							endDate: move.endDate ?? null,
							startTime: move.time ?? null,
							endTime: move.endTime ?? null,
						});
					}
				}}
			/>

			<QuickCreate
				draft={quick}
				exams={openExams}
				pending={
					createEvent.isPending || createSitting.isPending || createTask.isPending
				}
				onSave={saveQuick}
				onMore={moreOptions}
				onClose={() => setQuick(null)}
			/>

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
		</div>
	);
}

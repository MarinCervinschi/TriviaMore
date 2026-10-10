import { useCallback, useEffect, useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

import { refOf, toEntries } from "@/components/calendar/calendar-data";
import type { CalendarEntry, EntrySpan } from "@/components/calendar/calendar-model";
import {
	CalendarSheets,
	type SheetTarget,
	sheetFromQuick,
	sheetOf,
} from "@/components/calendar/calendar-sheets";
import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
import { QuickCreate, useQuickSave } from "@/components/calendar/quick-create";
import { readSidebarOpen } from "@/components/layout/sidebar-state";
import { CalendarSkeleton } from "@/components/skeletons";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useUpdateEvent, useUpdateSitting, useUpdateTask } from "@/lib/crm/mutations";
import { crmQueries } from "@/lib/crm/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/user/calendar")({
	loader: ({ context }) => context.queryClient.ensureQueryData(crmQueries.calendar()),
	head: () => seoHead({ title: "Calendario", noindex: true }),
	pendingComponent: CalendarSkeleton,
	component: CalendarPage,
});

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
	const [open, setOpen] = useState<SheetTarget>(null);
	const close = () => setOpen(null);

	const moveSitting = useUpdateSitting();
	const moveEvent = useUpdateEvent();
	const quietTask = useUpdateTask();

	const openExams = data.exams.filter(exam => !exam.passed);

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

	const quickSave = useQuickSave(() => setQuick(null));

	if (!hydrated) return <CalendarSkeleton />;

	return (
		<div className="px-4 py-4 md:px-6">
			<CalendarWorkspace
				entries={entries}
				today={format(new Date(), "yyyy-MM-dd")}
				canAddSitting={openExams.length > 0}
				className="h-[calc(100dvh-var(--app-header-h)-3rem)] min-h-[36rem]"
				onSelectEntry={entry => setOpen(sheetOf(refOf(entry)))}
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
				pending={quickSave.pending}
				onSave={quickSave.save}
				onMore={result => {
					setQuick(null);
					setOpen(sheetFromQuick(result));
				}}
				onClose={() => setQuick(null)}
			/>

			<CalendarSheets data={data} open={open} onClose={close} />
		</div>
	);
}

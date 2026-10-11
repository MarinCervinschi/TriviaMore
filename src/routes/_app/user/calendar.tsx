import { useEffect } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

import { refOf } from "@/components/calendar/calendar-data";
import { useCalendarSheets } from "@/components/calendar/calendar-sheets";
import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
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
	const sheets = useCalendarSheets(data);

	const moveSitting = useUpdateSitting();
	const moveEvent = useUpdateEvent();
	const quietTask = useUpdateTask();

	const hydrated = useIsHydrated();

	if (!hydrated) return <CalendarSkeleton />;

	return (
		<div className="px-4 py-4 md:px-6">
			<CalendarWorkspace
				entries={sheets.entries}
				today={format(new Date(), "yyyy-MM-dd")}
				canAddSitting={sheets.openExams.length > 0}
				className="h-[calc(100dvh-var(--app-header-h)-3rem)] min-h-[36rem]"
				onSelectEntry={sheets.openEntry}
				onCreate={sheets.startQuick}
				onCreateKind={kind => sheets.openSheet({ kind })}
				onToggleEntry={sheets.toggleEntry}
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

			{sheets.dialogs}
		</div>
	);
}

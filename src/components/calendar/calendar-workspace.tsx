import { useMemo, useState } from "react";

import { SidebarMinimalisticIcon } from "@solar-icons/react/linear/sidebar-minimalistic";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

import type { CalendarEntry, EntryKind, EntrySpan } from "./calendar-model";
import { CalendarSidebar } from "./calendar-sidebar";
import { PersonalCalendar } from "./personal-calendar";

/** The whole calendar page: a sidebar to jump and filter with, and the calendar beside it. */
export function CalendarWorkspace({
	entries,
	today,
	canAddSitting,
	initialDate,
	className,
	onSelectEntry,
	onMoveEntry,
	onCreate,
	onCreateKind,
	onToggleEntry,
}: {
	entries: CalendarEntry[];
	/** The viewer's local day, "yyyy-MM-dd". */
	today: string;
	canAddSitting: boolean;
	initialDate?: Date;
	className?: string;
	onSelectEntry: (entry: CalendarEntry) => void;
	onMoveEntry: (entry: CalendarEntry, move: EntrySpan) => void;
	onCreate: (draft: EntrySpan) => void;
	onCreateKind: (kind: "event" | "sitting" | "task") => void;
	onToggleEntry: (entry: CalendarEntry) => void;
}) {
	const isMobile = useIsMobile();
	const [date, setDate] = useState(() => initialDate ?? new Date());
	const [open, setOpen] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [hidden, setHidden] = useState<Set<EntryKind>>(() => new Set());
	const [showSessions, setShowSessions] = useState(true);

	const visible = useMemo(
		() => entries.filter(entry => !hidden.has(entry.kind)),
		[entries, hidden]
	);

	const sidebar = (
		<CalendarSidebar
			entries={entries}
			date={date}
			today={today}
			hidden={hidden}
			showSessions={showSessions}
			canAddSitting={canAddSitting}
			onDate={setDate}
			onToggleKind={kind =>
				setHidden(prev => {
					const next = new Set(prev);
					if (next.has(kind)) next.delete(kind);
					else next.add(kind);
					return next;
				})
			}
			onToggleSessions={() => setShowSessions(prev => !prev)}
			onCreate={onCreateKind}
			onSelectEntry={onSelectEntry}
		/>
	);

	const sidebarOpen = open && !isMobile;

	return (
		<div className={cn("flex min-h-0 gap-6", className)}>
			{sidebarOpen && (
				<aside className="flex w-64 shrink-0 flex-col pt-1">{sidebar}</aside>
			)}
			{isMobile && (
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetContent side="left" layout="panel" className="p-4 pt-12">
						<SheetTitle className="sr-only">Calendario</SheetTitle>
						{sidebar}
					</SheetContent>
				</Sheet>
			)}
			<PersonalCalendar
				entries={visible}
				date={date}
				onDateChange={setDate}
				showSessions={showSessions}
				className="min-w-0 flex-1"
				leading={
					<Button
						variant="ghost"
						size="icon"
						className="size-8"
						aria-label={sidebarOpen ? "Chiudi la colonna" : "Apri la colonna"}
						aria-pressed={sidebarOpen || mobileOpen}
						onClick={() => (isMobile ? setMobileOpen(true) : setOpen(prev => !prev))}
					>
						<SidebarMinimalisticIcon />
					</Button>
				}
				onSelectEntry={onSelectEntry}
				onMoveEntry={onMoveEntry}
				onToggleEntry={onToggleEntry}
				onCreate={onCreate}
			/>
		</div>
	);
}

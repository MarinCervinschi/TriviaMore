import { type ReactNode, useMemo } from "react";

import { addDays, addMinutes, format, min, startOfDay } from "date-fns";

import { EventCalendar } from "@/components/event-calendar/event-calendar";
import { EventCalendarContent } from "@/components/event-calendar/event-calendar-content";
import {
	EventCalendarNav,
	EventCalendarNavNext,
	EventCalendarNavPrev,
	EventCalendarNavToday,
	EventCalendarTitle,
	EventCalendarViewSwitcher,
} from "@/components/event-calendar/event-calendar-nav";
import type { CalendarView } from "@/components/event-calendar/event-calendar-types";
import { InsetCard } from "@/components/ui/inset-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { canMove, moveOf, timedSpan, toCalendarEvent } from "./calendar-adapter";
import { CALENDAR_I18N, CALENDAR_LOCALE } from "./calendar-i18n";
import { type CalendarEntry, type EntrySpan, sessionOn } from "./calendar-model";

const VIEWS: CalendarView[] = ["month", "week", "day", "agenda"];

const SESSIONS = {
	weekendDays: [],
	isOffDay: (day: Date) => Boolean(sessionOn(format(day, "yyyy-MM-dd"))),
	className: "bg-chart-2/8",
};

const day = (date: Date) => format(date, "yyyy-MM-dd");

/** The personal calendar: every kind of entry over the exam sessions, in month, week, day and agenda. */
export function PersonalCalendar({
	entries,
	date,
	onDateChange,
	defaultView = "week",
	showSessions = true,
	leading,
	actions,
	className,
	onSelectEntry,
	onMoveEntry,
	onToggleEntry,
	onCreate,
}: {
	entries: CalendarEntry[];
	date?: Date;
	onDateChange?: (date: Date) => void;
	defaultView?: CalendarView;
	showSessions?: boolean;
	/** Before the navigation, for the button that opens the sidebar. */
	leading?: ReactNode;
	actions?: ReactNode;
	className?: string;
	onSelectEntry?: (entry: CalendarEntry) => void;
	/** Fired after a drag or a resize the entry's kind allows. */
	onMoveEntry?: (entry: CalendarEntry, move: EntrySpan) => void;
	/** Fired by the tick on a checkable entry. */
	onToggleEntry?: (entry: CalendarEntry) => void;
	/** Fired by a click, or a drag, on empty days or hours. */
	onCreate?: (draft: EntrySpan) => void;
}) {
	const events = useMemo(
		() => entries.map(entry => toCalendarEvent(entry, onToggleEntry)),
		[entries, onToggleEntry]
	);

	return (
		<EventCalendar
			events={events}
			date={date}
			onDateChange={onDateChange}
			defaultView={defaultView}
			views={VIEWS}
			locale={CALENDAR_LOCALE}
			i18n={CALENDAR_I18N}
			weekStartsOn={1}
			dayStartHour={6}
			dayEndHour={24}
			scrollToHour={8}
			offDays={showSessions ? SESSIONS : undefined}
			navButtonVariant="outline"
			renderDayHeader={({ day: date, isToday }) => (
				<span className="flex flex-col items-center gap-1 py-1.5">
					<span
						className={cn("eyebrow", isToday ? "text-brand" : "text-muted-foreground")}
					>
						{format(date, "EEE", { locale: CALENDAR_LOCALE })}
					</span>
					<span
						className={cn(
							"flex size-10 items-center justify-center rounded-full text-2xl font-medium tabular-nums",
							isToday ? "bg-primary text-primary-foreground" : "text-foreground"
						)}
					>
						{format(date, "d")}
					</span>
				</span>
			)}
			onEventClick={occurrence => {
				if (occurrence.event.data) onSelectEntry?.(occurrence.event.data);
			}}
			canDropEvent={canMove}
			onEventUpdate={update => {
				const entry = update.event.data;
				if (!entry || !canMove(update)) return false;
				onMoveEntry?.(entry, moveOf(update));
				return true;
			}}
			onSlotClick={slot => {
				if (slot.allDay) {
					onCreate?.({ date: day(slot.date) });
					return;
				}
				const midnight = addDays(startOfDay(slot.date), 1);
				onCreate?.(timedSpan(slot.date, min([addMinutes(slot.date, 60), midnight])));
			}}
			onSelectSlot={slot => {
				const first = day(slot.start);
				if (slot.allDay) {
					const last = day(addDays(slot.end, -1));
					onCreate?.(last > first ? { date: first, endDate: last } : { date: first });
					return;
				}
				onCreate?.(timedSpan(slot.start, slot.end));
			}}
			className={className}
		>
			<div className="flex flex-wrap items-center gap-2 pb-3">
				{leading}
				<EventCalendarNav className="min-w-0 flex-1 gap-2 p-0">
					<TooltipProvider>
						<EventCalendarNavToday className="rounded-full px-4" />
						<div className="flex items-center">
							<EventCalendarNavPrev />
							<EventCalendarNavNext />
						</div>
						<EventCalendarTitle className="text-xl font-semibold first-letter:uppercase" />
						<div className="grow" />
						<EventCalendarViewSwitcher />
					</TooltipProvider>
				</EventCalendarNav>
				{actions}
			</div>
			<InsetCard className="min-h-0 flex-1" panelClassName="min-h-0 flex-1">
				<EventCalendarContent className="min-h-0 flex-1" />
			</InsetCard>
		</EventCalendar>
	);
}

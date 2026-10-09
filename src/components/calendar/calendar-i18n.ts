import { format, isSameMonth, isSameYear, subMilliseconds } from "date-fns";
import { it } from "date-fns/locale";

import type { EventCalendarI18nOverrides } from "@/components/event-calendar/event-calendar-i18n";

export const CALENDAR_LOCALE = it;

const opts = { locale: it };

const range = (start: Date, endExclusive: Date) => {
	const end = subMilliseconds(endExclusive, 1);
	if (isSameMonth(start, end)) {
		return `${format(start, "d", opts)}–${format(end, "d MMMM yyyy", opts)}`;
	}
	if (isSameYear(start, end)) {
		return `${format(start, "d MMM", opts)} – ${format(end, "d MMM yyyy", opts)}`;
	}
	return `${format(start, "d MMM yyyy", opts)} – ${format(end, "d MMM yyyy", opts)}`;
};

/** The ReUI calendar in Italian, with a 24-hour clock. */
export const CALENDAR_I18N: EventCalendarI18nOverrides = {
	labels: {
		today: "Oggi",
		previous: "Precedente",
		next: "Successivo",
		addEvent: "Aggiungi",
		allDay: "Tutto il giorno",
		more: count => `+${count} altri`,
		noEvents: "Niente in calendario",
		loading: "Caricamento del calendario",
		event: "voce",
		events: count => (count === 1 ? "1 voce" : `${count} voci`),
		selectView: "Scegli la vista",
		week: weekNumber => `S${weekNumber}`,
		resources: "Risorse",
		goToDate: "Vai a una data",
		dropNotAllowed: "Non si può spostare qui",
		continues: "continua",
		timeFrom: time => `Dalle ${time}`,
		timeUntil: time => `Fino alle ${time}`,
		viewShortcuts: {
			month: "M",
			week: "S",
			day: "G",
			days: "5",
			agenda: "A",
			resource: "R",
		},
		toggleDayEvents: count => (count === 1 ? "1 voce" : `${count} voci`),
		moreCompact: count => `+${count}`,
		timeRange: (from, to) => `${from}–${to}`,
	},
	viewNames: {
		month: "Mese",
		week: "Settimana",
		day: "Giorno",
		days: count => (count === 1 ? "1 giorno" : `${count} giorni`),
		agenda: "Agenda",
		resource: "Griglia",
	},
	formats: {
		monthTitle: "MMMM yyyy",
		dayTitle: "EEEE d MMMM yyyy",
		monthDayHeader: "EEE",
		monthDayHeaderNarrow: "EEEEE",
		timeGridDayHeader: "EEE d",
		agendaDayHeader: "EEEE d MMMM",
		agendaWeekday: "EEE",
		moreDayHeader: "EEEE d MMMM",
		timeGutter: "HH:mm",
		timeGutterMinute: "HH:mm",
		eventTime: "HH:mm",
	},
	functions: {
		formatTitle: (view, { date, activeRange }) => {
			if (view === "month") return format(date, "MMMM yyyy", opts);
			if (view === "day" || view === "resource") {
				return format(date, "EEEE d MMMM yyyy", opts);
			}
			return range(activeRange.start, activeRange.end);
		},
		formatEventTime: (start, end, allDay) => {
			if (allDay) return "Tutto il giorno";
			const last =
				end.getTime() - 1 >= start.getTime() ? subMilliseconds(end, 1) : start;
			if (format(start, "yyyy-MM-dd") !== format(last, "yyyy-MM-dd")) {
				return `${format(start, "d MMM HH:mm", opts)} – ${format(end, "d MMM HH:mm", opts)}`;
			}
			return `${format(start, "HH:mm", opts)}–${format(end, "HH:mm", opts)}`;
		},
		formatDayRange: ({ start, end }) => range(start, end),
	},
};

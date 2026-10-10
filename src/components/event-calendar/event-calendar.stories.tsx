import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { it } from "date-fns/locale";

import { EventCalendar } from "./event-calendar";
import { EventCalendarContent } from "./event-calendar-content";
import { EventCalendarNav } from "./event-calendar-nav";
import type { CalendarEvent } from "./event-calendar-types";

/** The ReUI event calendar as vendored, before our adapter: every view, drag, resize and create. */
const meta = {
	title: "Calendario/Motore",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const at = (day: number, hour: number, minute = 0) =>
	new Date(2027, 0, day, hour, minute);

const allDay = (day: number) => ({
	start: new Date(2027, 0, day),
	end: new Date(2027, 0, day + 1),
	allDay: true,
});

const EVENTS: CalendarEvent[] = [
	{
		id: "s1",
		title: "Ai for Bioinformatics, scritto",
		...allDay(14),
		color: "var(--color-heat-5)",
	},
	{ id: "s6", title: "Scalable ai", ...allDay(20), color: "var(--color-heat-2)" },
	{
		id: "e1",
		title: "Ricevimento",
		start: at(13, 10, 30),
		end: at(13, 11, 30),
		color: "var(--color-chart-4)",
	},
	{
		id: "e2",
		title: "Gruppo di studio",
		start: at(13, 15),
		end: at(13, 17),
		color: "var(--color-chart-4)",
	},
	{
		id: "p2",
		title: "Bioinformatics, capitolo 2",
		start: at(12, 9),
		end: at(12, 12),
		color: "var(--color-chart-3)",
	},
	{
		id: "p3",
		title: "Bioinformatics, esercizi",
		start: at(13, 9),
		end: at(13, 10),
		color: "var(--color-chart-3)",
	},
];

function Engine({ view }: { view: "month" | "week" | "day" | "agenda" }) {
	const [events, setEvents] = useState(EVENTS);
	return (
		<EventCalendar
			events={events}
			onEventsChange={setEvents}
			defaultView={view}
			defaultDate={new Date(2027, 0, 12)}
			locale={it}
			weekStartsOn={1}
			dayStartHour={7}
			dayEndHour={22}
			className="h-[44rem]"
		>
			<EventCalendarNav />
			<EventCalendarContent />
		</EventCalendar>
	);
}

export const Settimana: Story = {
	name: "Settimana",
	render: () => <Engine view="week" />,
};
export const Mese: Story = { name: "Mese", render: () => <Engine view="month" /> };
export const Giorno: Story = { name: "Giorno", render: () => <Engine view="day" /> };
export const Agenda: Story = { name: "Agenda", render: () => <Engine view="agenda" /> };

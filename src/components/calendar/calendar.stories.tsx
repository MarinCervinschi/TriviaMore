import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { CalendarDayCard } from "./calendar-day-card";
import type { EntrySpan } from "./calendar-model";
import { CalendarWorkspace } from "./calendar-workspace";
import { EventSheet } from "./event-sheet";
import { ENTRIES, OPEN_EXAMS, TODAY, TODAY_DATE } from "./fixtures";
import { QuickCreate } from "./quick-create";
import { SittingSheet } from "./sitting-sheet";
import { TaskSheet } from "./task-sheet";

/** The personal calendar: appelli, events and tasks, over the three exam sessions. */
const meta = {
	title: "Calendario/Calendario",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
	const [entries, setEntries] = useState(ENTRIES);
	const [quick, setQuick] = useState<EntrySpan | null>(null);
	return (
		<>
			<CalendarWorkspace
				entries={entries}
				today={TODAY}
				initialDate={TODAY_DATE}
				canAddSitting
				className="h-[48rem]"
				onSelectEntry={() => {}}
				onCreate={setQuick}
				onCreateKind={() => {}}
				onToggleEntry={entry =>
					setEntries(prev =>
						prev.map(row => (row.id === entry.id ? { ...row, done: !row.done } : row))
					)
				}
				onMoveEntry={(entry, move) =>
					setEntries(prev =>
						prev.map(row => (row.id === entry.id ? { ...row, ...move } : row))
					)
				}
			/>
			<QuickCreate
				draft={quick}
				exams={OPEN_EXAMS}
				pending={false}
				onSave={() => setQuick(null)}
				onMore={() => setQuick(null)}
				onClose={() => setQuick(null)}
			/>
		</>
	);
}

export const Pagina: Story = { name: "Pagina", render: () => <Demo /> };

export const Mobile: Story = {
	name: "Mobile",
	globals: { viewport: { value: "iphone6" } },
	render: () => <Demo />,
};

export const CreazioneRapida: Story = {
	name: "Creazione rapida",
	render: () => (
		<QuickCreate
			draft={{ date: "2027-01-13", time: "14:00", endTime: "15:00" }}
			exams={OPEN_EXAMS}
			pending={false}
			onSave={() => {}}
			onMore={() => {}}
			onClose={() => {}}
		/>
	),
};

export const NuovoAppello: Story = {
	name: "Sheet, nuovo appello",
	render: () => (
		<SittingSheet open exams={OPEN_EXAMS} onSubmit={() => {}} onClose={() => {}} />
	),
};

export const ModificaAppello: Story = {
	name: "Sheet, modifica appello",
	render: () => (
		<SittingSheet
			open
			editing
			exams={OPEN_EXAMS}
			initial={{
				examId: "e2",
				date: "2027-02-10",
				label: "Scritto",
				importance: 2,
				chosen: true,
			}}
			onSubmit={() => {}}
			onRemove={() => {}}
			onClose={() => {}}
		/>
	),
};

export const NuovoEvento: Story = {
	name: "Sheet, nuovo evento",
	render: () => (
		<EventSheet
			open
			exams={OPEN_EXAMS}
			initial={{ date: "2027-01-13", startTime: "10:30", endTime: "11:30" }}
			onSubmit={() => {}}
			onClose={() => {}}
		/>
	),
};

export const ModificaTask: Story = {
	name: "Sheet, modifica task",
	render: () => (
		<TaskSheet
			open
			editing
			exams={OPEN_EXAMS}
			initial={{
				title: "Bioinformatics, capitolo 2",
				dueDate: "2027-01-12",
				dueTime: "09:00",
				endTime: "12:00",
				examId: "e1",
				color: "chart-2",
			}}
			onSubmit={() => {}}
			onRemove={() => {}}
			onClose={() => {}}
		/>
	),
};

function DayCardDemo() {
	const [entries, setEntries] = useState(ENTRIES);
	return (
		<CalendarDayCard
			entries={entries}
			today={TODAY}
			onOpen={() => {}}
			onAdd={() => {}}
			onToggle={entry =>
				setEntries(prev =>
					prev.map(row => (row.id === entry.id ? { ...row, done: !row.done } : row))
				)
			}
		/>
	);
}

export const CardDashboard: Story = {
	name: "Card della dashboard",
	render: () => <DayCardDemo />,
};

export const CardDashboardMobile: Story = {
	name: "Card della dashboard, mobile",
	render: () => <DayCardDemo />,
	globals: { viewport: { value: "iphone6" } },
};

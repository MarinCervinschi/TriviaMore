import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { AchievementStrip } from "@/components/achievements/achievement-strip";
import { OVERVIEW } from "@/components/achievements/fixtures";
import { CalendarDayCard } from "@/components/calendar/calendar-day-card";
import { ENTRIES, TODAY } from "@/components/calendar/fixtures";
import { CareerCard } from "@/components/career/career-card";
import { CAREER, CAREER_EMPTY } from "@/components/career/fixtures";

import { DashboardBoard } from "./dashboard-board";

const meta = {
	title: "User/Dashboard",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Calendar() {
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

const NEXT = {
	examName: "Ai for Bioinformatics",
	date: "2027-01-14",
	label: "Scritto",
};

export const Completa: Story = {
	name: "La fascia centrale",
	render: () => (
		<div className="container py-6">
			<DashboardBoard
				calendar={<Calendar />}
				career={<CareerCard career={CAREER} next={NEXT} />}
				achievements={<AchievementStrip overview={OVERVIEW} />}
			/>
		</div>
	),
};

export const LibrettoVuoto: Story = {
	name: "Con il libretto vuoto",
	render: () => (
		<div className="container py-6">
			<DashboardBoard
				calendar={<Calendar />}
				career={<CareerCard career={CAREER_EMPTY} next={null} />}
				achievements={<AchievementStrip overview={OVERVIEW} />}
			/>
		</div>
	),
};

export const SenzaIscrizione: Story = {
	name: "Senza iscrizione",
	render: () => (
		<div className="container py-6">
			<DashboardBoard
				calendar={<Calendar />}
				career={null}
				achievements={<AchievementStrip overview={OVERVIEW} />}
			/>
		</div>
	),
};

export const Mobile: Story = {
	name: "Mobile",
	render: Completa.render,
	globals: { viewport: { value: "iphone6" } },
};

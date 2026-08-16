import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateRange } from "react-day-picker";

import { Calendar } from "./calendar";

const meta = {
	title: "UI/Calendar",
	parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SingleExample() {
	const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 7, 16));
	return (
		<Calendar
			mode="single"
			captionLayout="dropdown"
			startMonth={new Date(2020, 0)}
			endMonth={new Date(2027, 11)}
			selected={selected}
			onSelect={setSelected}
			defaultMonth={new Date(2026, 7, 1)}
		/>
	);
}

function RangeExample() {
	const [range, setRange] = useState<DateRange | undefined>({
		from: new Date(2026, 7, 4),
		to: new Date(2026, 7, 16),
	});
	return (
		<Calendar
			mode="range"
			captionLayout="dropdown"
			numberOfMonths={2}
			startMonth={new Date(2020, 0)}
			endMonth={new Date(2027, 11)}
			selected={range}
			onSelect={setRange}
			defaultMonth={new Date(2026, 7, 1)}
		/>
	);
}

export const Singola: Story = { render: () => <SingleExample /> };

export const Intervallo: Story = {
	name: "Intervallo",
	render: () => <RangeExample />,
};

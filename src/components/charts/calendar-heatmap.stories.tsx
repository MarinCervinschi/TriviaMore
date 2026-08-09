import type { Meta, StoryObj } from "@storybook/react-vite";

import { CalendarHeatmap } from "./calendar-heatmap";
import { studyYear } from "./fixtures";

const meta = {
	title: "Charts/CalendarHeatmap",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const year = studyYear();

/**
 * Magnitude on a sequential ramp — one hue, light to dark. It must never borrow
 * the categorical slots: the colour here means more-or-less, not which-one.
 */
export const Year: Story = {
	render: () => (
		<CalendarHeatmap
			title="Costanza di studio"
			description="Quiz completati per giorno, ultimo anno"
			data={year}
		/>
	),
};

export const LastTwelveWeeks: Story = {
	render: () => (
		<CalendarHeatmap
			title="Ultime dodici settimane"
			data={year}
			weeks={12}
			unitLabel="quiz"
		/>
	),
};

/** A fixed ceiling keeps two students' calendars comparable. */
export const FixedScale: Story = {
	render: () => (
		<CalendarHeatmap
			title="Costanza di studio"
			description="Scala fissata a 10 quiz al giorno"
			data={year}
			max={10}
		/>
	),
};

export const Empty: Story = {
	render: () => (
		<CalendarHeatmap
			title="Costanza di studio"
			data={[]}
			emptyMessage="Nessun quiz registrato quest'anno."
		/>
	),
};

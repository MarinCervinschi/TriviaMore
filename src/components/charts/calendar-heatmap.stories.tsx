import type { Meta, StoryObj } from "@storybook/react-vite";

import { CalendarHeatmap } from "./calendar-heatmap";
import { studyActivity } from "./fixtures";

const meta = {
	title: "Charts/CalendarHeatmap",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const activity = studyActivity();

/** The last 12 months. */
export const Rolling: Story = {
	render: () => <CalendarHeatmap data={activity} view="rolling" endDate="2026-08-08" />,
};

/** A whole calendar year; in the current year the days to come are empty. */
export const Anno: Story = {
	render: () => <CalendarHeatmap data={activity} view={2026} endDate="2026-08-08" />,
};

export const Empty: Story = {
	render: () => (
		<CalendarHeatmap data={[]} view="rolling" emptyMessage="Nessun quiz registrato." />
	),
};

/** The bare grid, for a card that already provides a frame. */
export const SenzaCornice: Story = {
	name: "Senza cornice",
	render: () => <CalendarHeatmap data={activity} view="rolling" endDate="2026-08-08" />,
};

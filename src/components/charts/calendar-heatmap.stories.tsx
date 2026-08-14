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

/**
 * Default is the rolling last-12-months window; the year picker (only years with
 * activity) shows a full Jan–Dec calendar. Magnitude on a sequential ramp — it
 * never borrows the categorical slots. Click a year, hover a cell, both themes.
 */
export const Default: Story = {
	render: () => (
		<CalendarHeatmap title="La tua attività" data={activity} endDate="2026-08-08" />
	),
};

export const Empty: Story = {
	render: () => (
		<CalendarHeatmap
			title="La tua attività"
			data={[]}
			emptyMessage="Nessun quiz registrato: completa il primo per iniziare a tracciare l'attività."
		/>
	),
};

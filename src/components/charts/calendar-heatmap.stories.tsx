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
 * Controlled by `view`: `"rolling"` is the last 12 months. Magnitude on a
 * sequential ramp — never the categorical slots. Hover a cell; both themes.
 */
export const Rolling: Story = {
	render: () => <CalendarHeatmap data={activity} view="rolling" endDate="2026-08-08" />,
};

/** A whole calendar year, Jan–Dec — the current year shows the rest as empty. */
export const Anno: Story = {
	render: () => <CalendarHeatmap data={activity} view={2026} endDate="2026-08-08" />,
};

export const Empty: Story = {
	render: () => (
		<CalendarHeatmap data={[]} view="rolling" emptyMessage="Nessun quiz registrato." />
	),
};

/** Senza cornice: la griglia nuda, per una card che ne fornisce già una. */
export const SenzaCornice: Story = {
	name: "Senza cornice",
	render: () => <CalendarHeatmap data={activity} view="rolling" endDate="2026-08-08" />,
};

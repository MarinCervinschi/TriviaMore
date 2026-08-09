import type { Meta, StoryObj } from "@storybook/react-vite";

import { gradeTrend, monthlyActivity } from "./fixtures";
import { TimeSeriesChart } from "./time-series-chart";

const meta = {
	title: "Charts/TimeSeriesChart",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** One series needs no legend — the title already names it. */
export const AreaSingle: Story = {
	render: () => (
		<TimeSeriesChart
			title="Quiz completati"
			description="Ultimi otto mesi"
			data={monthlyActivity}
			xKey="mese"
			series={[{ key: "quiz", label: "Quiz" }]}
		/>
	),
};

export const AreaMultiSeries: Story = {
	render: () => (
		<TimeSeriesChart
			title="Attività per modalità"
			data={monthlyActivity}
			xKey="mese"
			series={[
				{ key: "quiz", label: "Quiz" },
				{ key: "flashcard", label: "Flashcard" },
			]}
		/>
	),
};

/** Stacked bands are separated by a 2px surface stroke, so the boundary reads as a gap. */
export const AreaStacked: Story = {
	render: () => (
		<TimeSeriesChart
			title="Attività totale"
			description="Quiz e flashcard impilati"
			data={monthlyActivity}
			xKey="mese"
			stacked
			series={[
				{ key: "quiz", label: "Quiz" },
				{ key: "flashcard", label: "Flashcard" },
			]}
		/>
	),
};

export const LineWithFixedDomain: Story = {
	render: () => (
		<TimeSeriesChart
			title="Andamento della media"
			description="Scala in trentesimi"
			variant="line"
			data={gradeTrend}
			xKey="mese"
			yDomain={[18, 30]}
			valueFormatter={value => value.toFixed(0)}
			series={[{ key: "media", label: "Media" }]}
		/>
	),
};

export const Empty: Story = {
	render: () => (
		<TimeSeriesChart
			title="Quiz completati"
			data={[] as typeof monthlyActivity}
			xKey="mese"
			series={[{ key: "quiz", label: "Quiz" }]}
			emptyMessage="Nessun quiz negli ultimi mesi."
		/>
	),
};

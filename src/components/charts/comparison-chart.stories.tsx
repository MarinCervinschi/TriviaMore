import type { Meta, StoryObj } from "@storybook/react-vite";

import { getGradeChartColor } from "@/lib/utils/grading";

import { ComparisonChart } from "./comparison-chart";
import { departmentCourses, monthlyActivity, sectionScores } from "./fixtures";

const meta = {
	title: "Charts/ComparisonChart",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
	render: () => (
		<ComparisonChart
			title="Quiz per mese"
			data={monthlyActivity}
			categoryKey="mese"
			series={[{ key: "quiz", label: "Quiz" }]}
		/>
	),
};

/** Horizontal is what long category names need — the label gets a real column. */
export const Horizontal: Story = {
	render: () => (
		<ComparisonChart
			title="Corsi per dipartimento"
			data={departmentCourses}
			categoryKey="dipartimento"
			orientation="horizontal"
			showValues
			categoryWidth={80}
			height={220}
			series={[{ key: "corsi", label: "Corsi" }]}
		/>
	),
};

export const Grouped: Story = {
	render: () => (
		<ComparisonChart
			title="Media e miglior voto"
			description="Per sezione, in trentesimi"
			data={sectionScores}
			categoryKey="sezione"
			orientation="horizontal"
			categoryWidth={160}
			height={300}
			series={[
				{ key: "media", label: "Media" },
				{ key: "migliore", label: "Migliore" },
			]}
		/>
	),
};

export const Stacked: Story = {
	render: () => (
		<ComparisonChart
			title="Attività per mese"
			data={monthlyActivity}
			categoryKey="mese"
			stacked
			series={[
				{ key: "quiz", label: "Quiz" },
				{ key: "flashcard", label: "Flashcard" },
			]}
		/>
	),
};

/**
 * A single series whose colour carries meaning: the grade band, not a category.
 * Status colours are reserved for exactly this and never used as "series 4".
 */
export const ColouredByGradeBand: Story = {
	render: () => (
		<ComparisonChart
			title="Performance per sezione"
			description="Il colore segue la fascia di voto"
			data={sectionScores}
			categoryKey="sezione"
			orientation="horizontal"
			categoryWidth={160}
			height={260}
			showValues
			barColor={datum => getGradeChartColor(datum.media)}
			valueFormatter={value => value.toFixed(0)}
			series={[{ key: "media", label: "Media" }]}
		/>
	),
};

export const Empty: Story = {
	render: () => (
		<ComparisonChart
			title="Corsi per dipartimento"
			data={[] as typeof departmentCourses}
			categoryKey="dipartimento"
			series={[{ key: "corsi", label: "Corsi" }]}
			emptyMessage="Nessun corso pubblicato."
		/>
	),
};

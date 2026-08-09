import type { Meta, StoryObj } from "@storybook/react-vite";

import { DonutChart, foldDonutTail } from "./donut-chart";
import { courseTypes, manyDepartments } from "./fixtures";

const meta = {
	title: "Charts/DonutChart",
	parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="w-80">
			<DonutChart title="Corsi per tipo" unitLabel="corsi" data={courseTypes} />
		</div>
	),
};

/**
 * Past five slices a sixth hue would not survive the palette's separation
 * checks, so the tail folds into one neutral "Altro" instead.
 */
export const FoldedTail: Story = {
	render: () => (
		<div className="w-80">
			<DonutChart
				title="Corsi per dipartimento"
				description="Oltre il quinto, il resto confluisce in «Altro»"
				unitLabel="corsi"
				data={foldDonutTail(manyDepartments)}
			/>
		</div>
	),
};

export const WithoutLegend: Story = {
	render: () => (
		<div className="w-64">
			<DonutChart
				title="Domande per tipo"
				unitLabel="domande"
				hideLegend
				data={[
					{ key: "QUIZ", label: "Quiz", value: 412, color: "var(--color-chart-2)" },
					{
						key: "FLASHCARD",
						label: "Flashcard",
						value: 189,
						color: "var(--color-chart-3)",
					},
				]}
			/>
		</div>
	),
};

export const Empty: Story = {
	render: () => (
		<div className="w-80">
			<DonutChart
				title="Corsi per tipo"
				unitLabel="corsi"
				data={[]}
				emptyMessage="Nessun corso in catalogo."
			/>
		</div>
	),
};

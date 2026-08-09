import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatThirtyScaleGrade, getGradeChartColor } from "@/lib/utils/grading";

import { RadialGauge } from "./radial-gauge";

const meta = {
	title: "Charts/RadialGauge",
	parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The gauge earns its place only when the maximum means something. */
export const GradeBands: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-8">
			{[15, 20, 25, 28, 31].map(score => (
				<div key={score} className="flex flex-col items-center gap-2">
					<RadialGauge
						value={score}
						max={33}
						label={formatThirtyScaleGrade(score)}
						caption="media"
						color={getGradeChartColor(score)}
					/>
					<span className="text-muted-foreground text-xs">{score}/33</span>
				</div>
			))}
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			{[64, 96, 140].map(size => (
				<RadialGauge key={size} value={68} max={100} label="68%" size={size} />
			))}
		</div>
	),
};

export const Completion: Story = {
	render: () => (
		<RadialGauge value={42} max={60} label="42" caption="di 60" size={120} />
	),
};

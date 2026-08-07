import type { Meta, StoryObj } from "@storybook/react-vite";

import { DonutChart } from "./donut-chart";

const meta = {
	title: "Charts/Donut",
	component: DonutChart,
	tags: ["autodocs"],
	decorators: [
		Story => (
			<div className="w-72">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Courses: Story = {
	args: {
		title: "Corsi per tipo",
		unitLabel: "corsi",
		colors: {
			BACHELOR: "var(--color-chart-2)",
			MASTER: "var(--color-chart-3)",
			SINGLE_CYCLE: "var(--color-chart-4)",
		},
		data: [
			{ type: "BACHELOR", label: "Triennale", count: 38 },
			{ type: "MASTER", label: "Magistrale", count: 21 },
			{ type: "SINGLE_CYCLE", label: "Ciclo unico", count: 5 },
		],
	},
};

export const Questions: Story = {
	args: {
		title: "Domande per tipo",
		unitLabel: "domande",
		colors: {
			QUIZ: "var(--color-chart-2)",
			FLASHCARD: "var(--color-chart-3)",
		},
		data: [
			{ type: "QUIZ", label: "Quiz", count: 1240 },
			{ type: "FLASHCARD", label: "Flashcard", count: 460 },
		],
	},
};

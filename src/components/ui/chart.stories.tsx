import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "./chart";

const barData = [
	{ mese: "Set", quiz: 12 },
	{ mese: "Ott", quiz: 28 },
	{ mese: "Nov", quiz: 41 },
	{ mese: "Dic", quiz: 33 },
	{ mese: "Gen", quiz: 57 },
];

const barConfig = {
	quiz: { label: "Quiz completati", color: "#6366f1" },
} satisfies ChartConfig;

const pieData = [
	{ esito: "corrette", risposte: 68, fill: "#22c55e" },
	{ esito: "errate", risposte: 22, fill: "#ef4444" },
	{ esito: "saltate", risposte: 10, fill: "#a1a1aa" },
];

const pieConfig = {
	risposte: { label: "Risposte" },
	corrette: { label: "Corrette", color: "#22c55e" },
	errate: { label: "Errate", color: "#ef4444" },
	saltate: { label: "Saltate", color: "#a1a1aa" },
} satisfies ChartConfig;

const meta = {
	title: "UI/Chart",
	component: ChartContainer,
	tags: ["autodocs"],
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		config: barConfig,
		className: "min-h-[220px] w-[480px]",
		children: (
			<BarChart accessibilityLayer data={barData}>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="mese" tickLine={false} axisLine={false} tickMargin={8} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<Bar dataKey="quiz" fill="var(--color-quiz)" radius={6} />
			</BarChart>
		),
	},
};

export const Pie_: Story = {
	name: "Pie",
	args: {
		config: pieConfig,
		className: "mx-auto aspect-square max-h-64",
		children: (
			<PieChart>
				<ChartTooltip content={<ChartTooltipContent nameKey="esito" />} />
				<Pie data={pieData} dataKey="risposte" nameKey="esito" />
			</PieChart>
		),
	},
};

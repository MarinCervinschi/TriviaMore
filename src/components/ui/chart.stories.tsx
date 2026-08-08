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
	quiz: { label: "Quiz completati", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const pieData = [
	{ esito: "corrette", risposte: 68, fill: "var(--color-success)" },
	{ esito: "errate", risposte: 22, fill: "var(--color-destructive)" },
	{ esito: "saltate", risposte: 10, fill: "var(--color-muted-foreground)" },
];

const pieConfig = {
	risposte: { label: "Risposte" },
	corrette: { label: "Corrette", color: "var(--color-success)" },
	errate: { label: "Errate", color: "var(--color-destructive)" },
	saltate: { label: "Saltate", color: "var(--color-muted-foreground)" },
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

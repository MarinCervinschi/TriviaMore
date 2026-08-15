import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ChartCard } from "./chart-card";
import { DonutChart } from "./donut-chart";
import { TimeSeriesChart } from "./time-series-chart";

/**
 * The shell every chart shares. The plots have their own stories — this one is about the frame: the
 * heading, the actions and the footer.
 */
const meta = {
	title: "Charts/ChartCard",
	component: ChartCard,
	parameters: { layout: "padded" },
} satisfies Meta<typeof ChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
	{ date: "2026-07-01", value: 24 },
	{ date: "2026-07-08", value: 31 },
	{ date: "2026-07-15", value: 28 },
	{ date: "2026-07-22", value: 42 },
	{ date: "2026-07-29", value: 38 },
	{ date: "2026-08-05", value: 51 },
];

const Plot = () => (
	<TimeSeriesChart
		data={SERIES}
		xKey="date"
		series={[{ key: "value", label: "Quiz completati" }]}
	/>
);

export const Default: Story = {
	args: {
		title: "Attività",
		description: "Quiz completati per settimana",
		children: <Plot />,
	},
};

export const WithActions: Story = {
	name: "Con azioni",
	args: {
		title: "Attività",
		description: "Quiz completati per settimana",
		actions: (
			<>
				<Badge variant="secondary" size="sm">
					6 settimane
				</Badge>
				<Button variant="ghost" size="sm">
					Tutto
				</Button>
			</>
		),
		children: <Plot />,
	},
};

export const WithFooter: Story = {
	name: "Con footer",
	args: {
		title: "Distribuzione",
		footer: (
			<p className="text-muted-foreground text-xs">
				Su 214 tentativi. Le sezioni senza tentativi non compaiono.
			</p>
		),
		children: (
			<DonutChart
				unitLabel="risposte"
				data={[
					{ key: "right", label: "Corrette", value: 148 },
					{ key: "wrong", label: "Sbagliate", value: 47 },
					{ key: "saved", label: "Salvate", value: 19 },
				]}
			/>
		),
	},
};

/** No heading at all: the card collapses to padding, which is how a bare plot is dropped in a grid. */
export const Bare: Story = {
	name: "Senza intestazione",
	args: { children: <Plot /> },
};

export const InAGrid: Story = {
	name: "In griglia",
	args: { children: null },
	render: () => (
		<div className="grid gap-4 lg:grid-cols-2">
			<ChartCard title="Attività" description="Per settimana">
				<Plot />
			</ChartCard>
			<ChartCard title="Distribuzione" description="Risposte per esito">
				<DonutChart
					unitLabel="risposte"
					data={[
						{ key: "right", label: "Corrette", value: 148 },
						{ key: "wrong", label: "Sbagliate", value: 47 },
					]}
				/>
			</ChartCard>
		</div>
	),
};

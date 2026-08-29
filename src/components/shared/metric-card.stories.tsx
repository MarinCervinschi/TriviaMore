import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MetricCard } from "./metric-card";
import { StatCard } from "./stat-card";

const meta = {
	title: "Stat Cards/MetricCard",
	component: MetricCard,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	argTypes: {
		texture: {
			control: "inline-radio",
			options: ["tr", "tl", "br", "bl", "top", "edges", null],
		},
		deltaUnit: { control: "inline-radio", options: ["percent", "points", "raw"] },
	},
	args: {
		label: "Quiz completati",
		value: 70,
		icon: CupFirstIcon,
		tint: "text-chart-1",
		delta: 14,
		comparison: "vs 61 nel periodo precedente",
	},
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No baseline to compare against: the pill disappears rather than reading "0%". */
export const SenzaDelta: Story = {
	name: "Senza confronto",
	args: { delta: null, comparison: undefined },
};

export const InCalo: Story = {
	name: "In calo",
	args: {
		label: "Tempo di studio",
		value: "17h 42m",
		icon: ClockCircleIcon,
		tint: "text-chart-4",
		delta: -6,
		comparison: "15m medi per quiz",
	},
};

/** The row as the analytics page lays it out: four measurements, four baselines. */
export const Riga: Story = {
	name: "La riga della pagina",
	render: () => (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				label="Quiz completati"
				value={70}
				icon={CupFirstIcon}
				tint="text-chart-1"
				delta={14}
				comparison="vs 61 nel periodo precedente"
			/>
			<MetricCard
				label="Media voto"
				value="29.7"
				unit="/33"
				icon={GraphUpIcon}
				tint="text-chart-3"
				delta={1.2}
				deltaUnit="raw"
				comparison="vs 28.5/33 nel periodo precedente"
			/>
			<MetricCard
				label="Accuratezza"
				value="86%"
				icon={CheckCircleIcon}
				tint="text-chart-2"
				delta={3}
				deltaUnit="points"
				comparison="1.240 risposte · 83% prima"
			/>
			<MetricCard
				label="Tempo di studio"
				value="17h 42m"
				icon={ClockCircleIcon}
				tint="text-chart-4"
				delta={-6}
				comparison="15m medi per quiz"
			/>
		</div>
	),
};

/**
 * The two card anatomies side by side: `StatCard` is a decorative tile for a
 * count, `MetricCard` a measurement that carries its own baseline.
 */
/** The pixel field, moved around the card — `null` leaves it bare. */
export const Texture: Story = {
	name: "La texture",
	render: () => (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{(["tr", "tl", "edges", null] as const).map(texture => (
				<MetricCard
					key={String(texture)}
					label={texture ?? "nessuna"}
					value={70}
					icon={CupFirstIcon}
					tint="text-chart-1"
					delta={14}
					texture={texture}
					comparison="vs 61 nel periodo precedente"
				/>
			))}
		</div>
	),
};

export const ControStatCard: Story = {
	name: "Contro StatCard",
	render: () => (
		<div className="grid gap-4 sm:grid-cols-2">
			<StatCard label="Quiz completati" value={70} icon={CupFirstIcon} color="yellow" />
			<MetricCard
				label="Quiz completati"
				value={70}
				icon={CupFirstIcon}
				tint="text-chart-1"
				delta={14}
				comparison="vs 61 nel periodo precedente"
			/>
		</div>
	),
};

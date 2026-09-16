import type { Meta, StoryObj } from "@storybook/react-vite";

import { InsetCard } from "@/components/ui/inset-card";

import { TickArc, TickBar } from "./tick-gauge";

const meta = {
	title: "Charts/Tick gauge",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STEPS = [
	{ value: 0, max: 24, note: "vuoto" },
	{ value: 1, max: 24, note: "una sola tacca" },
	{ value: 10, max: 24, note: "il caso reale" },
	{ value: 23, max: 24, note: "quasi pieno" },
	{ value: 24, max: 24, note: "pieno" },
];

export const Arco: Story = {
	name: "L'arco, dal vuoto al pieno",
	render: () => (
		<InsetCard
			title="TickArc"
			description="La geometria è una costante: trigonometria al render romperebbe l'idratazione, come avverte ScoreRing."
		>
			<div className="flex flex-wrap items-end gap-8 px-4 py-4">
				{STEPS.map(step => (
					<div key={step.note} className="flex w-[140px] flex-col items-center gap-2">
						<TickArc
							value={step.value}
							max={step.max}
							label={String(step.value)}
							caption={`di ${step.max}`}
							className="w-[132px]"
						/>
						<span className="text-muted-foreground text-2xs">{step.note}</span>
					</div>
				))}
			</div>
		</InsetCard>
	),
};

export const Barra: Story = {
	name: "La barra, nei due toni",
	render: () => (
		<InsetCard
			title="TickBar"
			description="Figli flex, nessuna geometria: si ridistribuisce a qualsiasi larghezza. `current` prende il colore intorno, per una categoria."
		>
			<div className="flex flex-col gap-5 px-4 py-4">
				{[
					{ value: 0, max: 25 },
					{ value: 7, max: 25 },
					{ value: 18, max: 25 },
					{ value: 25, max: 25 },
				].map(step => (
					<div key={step.value} className="flex items-center gap-4">
						<TickBar value={step.value} max={step.max} className="flex-1" />
						<TickBar
							value={step.value}
							max={step.max}
							tone="current"
							className="text-chart-2-ink flex-1"
						/>
						<span className="text-muted-foreground text-2xs w-16 tabular-nums">
							{step.value} / {step.max}
						</span>
					</div>
				))}
			</div>
		</InsetCard>
	),
};

/** Una soglia di 1 è binaria: la barra sarebbe vuota o piena, mai in mezzo. */
export const Limiti: Story = {
	name: "I casi limite",
	render: () => (
		<InsetCard title="Zero, uno, e un massimo assente">
			<div className="flex flex-wrap items-end gap-8 px-4 py-4">
				<div className="w-[132px]">
					<TickArc value={5} max={0} label="—" caption="max 0" />
				</div>
				<div className="w-[132px]">
					<TickArc value={99} max={24} label="99" caption="oltre il massimo" />
				</div>
				<div className="w-[220px] space-y-3">
					<TickBar value={0} max={1} />
					<TickBar value={1} max={1} />
					<TickBar value={9} max={0} />
				</div>
			</div>
		</InsetCard>
	),
};

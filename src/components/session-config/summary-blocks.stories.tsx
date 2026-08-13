import type { Meta, StoryObj } from "@storybook/react-vite";

import { EVAL_MODES } from "./fixtures";
import {
	CardStackBlock,
	EvalBlock,
	Eyebrow,
	MetricBlock,
	TimeBlock,
} from "./summary-blocks";
import { SummaryPanel } from "./summary-panel";

// The live summary beside a session form: one block per thing the user just chose.
const meta = {
	title: "Session Dialogs/Summary blocks",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Metric: Story = {
	render: () => (
		<div className="grid max-w-md gap-4">
			<MetricBlock eyebrow="Domande" value={24} total={142} showBar />
			<MetricBlock eyebrow="Domande" value={142} total={142} hint="Tutte" showBar />
			<MetricBlock eyebrow="Punteggio" value="29.4" hint="su 30" />
		</div>
	),
};

export const Time: Story = {
	render: () => (
		<div className="grid max-w-md gap-4">
			<TimeBlock minutes={15} questionCount={24} />
			<TimeBlock minutes={120} questionCount={142} />
			<TimeBlock minutes={null} questionCount={24} />
		</div>
	),
};

export const CardStack: Story = {
	name: "Pila di carte",
	render: () => (
		<div className="grid max-w-md gap-4">
			<CardStackBlock count={8} max={142} />
			<CardStackBlock count={142} max={142} />
			<CardStackBlock count={1} max={1} />
		</div>
	),
};

export const Eval: Story = {
	name: "Modalità di valutazione",
	render: () => (
		<div className="grid max-w-md gap-4">
			{EVAL_MODES.map(mode => (
				<EvalBlock key={mode.id} mode={mode} questionCount={24} />
			))}
		</div>
	),
};

export const InPanel: Story = {
	name: "Dentro il pannello",
	render: () => (
		<SummaryPanel
			footerTip="Puoi cambiare tutto prima di iniziare."
			className="max-w-sm"
		>
			<Eyebrow>Riepilogo</Eyebrow>
			<MetricBlock eyebrow="Domande" value={24} total={142} showBar />
			<TimeBlock minutes={15} questionCount={24} />
			<EvalBlock mode={EVAL_MODES[1]} questionCount={24} />
		</SummaryPanel>
	),
};

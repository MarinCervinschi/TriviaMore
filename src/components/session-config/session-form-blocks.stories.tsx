import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { TIME_STEPS } from "@/lib/quiz/constants";

import { EVAL_MODES } from "./fixtures";
import {
	EvalInfoCard,
	EvalSelect,
	SliderWithInput,
	TimeTickRow,
} from "./session-form-blocks";

// The controls a session form is made of. Every one is stateful, so each story owns its state.
const meta = {
	title: "Session Dialogs/Form blocks",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Slider({ max }: { max: number }) {
	const [value, setValue] = useState(Math.min(24, max));
	return (
		<SliderWithInput
			label="Numero di domande"
			value={value}
			onChange={setValue}
			min={1}
			max={max}
			hint={value === max ? `Tutte (${max})` : `${value} di ${max}`}
		/>
	);
}

export const Slider142: Story = {
	name: "Slider — 142 disponibili",
	render: () => (
		<div className="max-w-md">
			<Slider max={142} />
		</div>
	),
};

/** A range of one: the slider has nothing to slide, and should not look broken. */
export const SliderSingle: Story = {
	name: "Slider — una sola domanda",
	render: () => (
		<div className="max-w-md">
			<Slider max={1} />
		</div>
	),
};

function Ticks() {
	const [index, setIndex] = useState(2);
	return <TimeTickRow steps={TIME_STEPS} index={index} onChange={setIndex} />;
}

export const Time: Story = {
	name: "Selettore di tempo",
	render: () => (
		<div className="max-w-md">
			<Ticks />
		</div>
	),
};

function Eval() {
	const [value, setValue] = useState(EVAL_MODES[0].id);
	const mode = EVAL_MODES.find(m => m.id === value);
	return (
		<div className="max-w-md space-y-4">
			<EvalSelect modes={EVAL_MODES} value={value} onChange={setValue} />
			{mode && <EvalInfoCard mode={mode} />}
		</div>
	);
}

export const Evaluation: Story = {
	name: "Modalità di valutazione",
	render: () => <Eval />,
};

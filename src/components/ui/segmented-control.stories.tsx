import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { SegmentedControl } from "./segmented-control";

/**
 * The filter that shows every choice at once. Two sizes: the default for a desktop
 * toolbar, `lg` where a finger has to hit it.
 */
const meta = {
	title: "UI/SegmentedControl",
	parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const REVIEW = [
	{ value: "todo" as const, label: "Da rivedere", count: 7 },
	{ value: "all" as const, label: "Tutte", count: 30 },
	{ value: "correct" as const, label: "Corrette", count: 23 },
];

function Example({ size }: { size?: "default" | "lg" }) {
	const [value, setValue] = useState<"todo" | "all" | "correct">("todo");
	return (
		<SegmentedControl
			label="Filtra le domande"
			value={value}
			onChange={setValue}
			options={REVIEW}
			size={size}
		/>
	);
}

export const Default: Story = {
	name: "Con i conteggi",
	render: () => <Example />,
};

/** Without counts, and at the touch size the phone layouts use. */
export const Touch: Story = {
	name: "Formato touch",
	render: () => (
		<div className="flex flex-col items-start gap-6">
			<Example size="lg" />
			<Plain />
		</div>
	),
};

function Plain() {
	const [value, setValue] = useState<"study" | "exam">("study");
	return (
		<SegmentedControl
			label="Modalità"
			value={value}
			onChange={setValue}
			options={[
				{ value: "study", label: "Studio" },
				{ value: "exam", label: "Simulazione d'esame" },
			]}
		/>
	);
}

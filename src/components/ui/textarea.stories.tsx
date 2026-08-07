import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
	title: "UI/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	args: { placeholder: "Scrivi la tua risposta…" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "Non modificabile" },
};

export const WithLabel: Story = {
	render: (args) => (
		<div className="grid w-96 gap-2">
			<Label htmlFor="spiegazione">Spiegazione</Label>
			<Textarea
				{...args}
				id="spiegazione"
				placeholder="Aggiungi una spiegazione alla domanda…"
			/>
		</div>
	),
};

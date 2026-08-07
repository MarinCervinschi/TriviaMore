import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
	title: "UI/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const WithLabel: Story = {
	render: args => (
		<div className="flex items-center gap-2">
			<Checkbox {...args} id="terms" />
			<Label htmlFor="terms">Accetto i termini</Label>
		</div>
	),
};

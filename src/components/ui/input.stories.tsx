import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
	title: "UI/Input",
	component: Input,
	tags: ["autodocs"],
	args: { placeholder: "Scrivi qui…" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "Non modificabile" },
};

export const WithLabel: Story = {
	render: args => (
		<div className="grid w-72 gap-2">
			<Label htmlFor="email">Email</Label>
			<Input {...args} id="email" type="email" placeholder="mario@unimore.it" />
		</div>
	),
};

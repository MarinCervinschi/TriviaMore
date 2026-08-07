import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
	title: "UI/Label",
	component: Label,
	tags: ["autodocs"],
	args: { children: "Email istituzionale" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
	render: (args) => (
		<div className="grid w-72 gap-2">
			<Label {...args} htmlFor="email" />
			<Input id="email" type="email" placeholder="mario@studenti.unimore.it" />
		</div>
	),
};

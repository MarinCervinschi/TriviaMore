import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { PasswordInput } from "./password-input";

const meta = {
	title: "UI/PasswordInput",
	component: PasswordInput,
	tags: ["autodocs"],
	args: { placeholder: "La tua password" },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
	render: args => (
		<div className="grid w-72 gap-2">
			<Label htmlFor="pw">Password</Label>
			<PasswordInput {...args} id="pw" autoComplete="current-password" />
		</div>
	),
};

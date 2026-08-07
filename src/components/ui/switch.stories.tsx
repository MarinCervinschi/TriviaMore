import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
	title: "UI/Switch",
	component: Switch,
	tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const WithLabel: Story = {
	render: (args) => (
		<div className="flex items-center gap-2">
			<Switch {...args} id="notifications" />
			<Label htmlFor="notifications">Notifiche email</Label>
		</div>
	),
};

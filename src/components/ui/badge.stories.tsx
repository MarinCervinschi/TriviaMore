import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
	title: "UI/Badge",
	component: Badge,
	tags: ["autodocs"],
	args: { children: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
	render: (args) => (
		<div className="flex flex-wrap items-center gap-2">
			<Badge {...args} variant="default">
				Default
			</Badge>
			<Badge {...args} variant="secondary">
				Secondary
			</Badge>
			<Badge {...args} variant="destructive">
				Destructive
			</Badge>
			<Badge {...args} variant="outline">
				Outline
			</Badge>
		</div>
	),
};

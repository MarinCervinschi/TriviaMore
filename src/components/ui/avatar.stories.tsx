import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta = {
	title: "UI/Avatar",
	component: Avatar,
	tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Mario Rossi" />
			<AvatarFallback>MR</AvatarFallback>
		</Avatar>
	),
};

export const Fallback: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>GB</AvatarFallback>
		</Avatar>
	),
};

export const Group: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Avatar>
				<AvatarFallback>MR</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>GB</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>LV</AvatarFallback>
			</Avatar>
		</div>
	),
};

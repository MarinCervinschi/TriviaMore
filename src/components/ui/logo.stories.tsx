import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo, LogoIcon } from "./logo";

const meta = {
	title: "UI/Logo",
	component: Logo,
	tags: ["autodocs"],
	argTypes: {
		size: { control: "select", options: ["sm", "md", "lg"] },
	},
	args: { size: "md" },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
	render: (args) => (
		<div className="flex flex-col items-start gap-4">
			<Logo {...args} size="sm" />
			<Logo {...args} size="md" />
			<Logo {...args} size="lg" />
		</div>
	),
};

export const IconOnly: Story = {
	render: () => <LogoIcon size={48} />,
};

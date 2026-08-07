import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

const meta = {
	title: "UI/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
		},
		size: { control: "select", options: ["default", "sm", "lg", "icon"] },
	},
	args: { children: "Button", variant: "default", size: "default" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
	render: args => (
		<div className="flex flex-wrap items-center gap-3">
			<Button {...args} variant="default">
				Default
			</Button>
			<Button {...args} variant="secondary">
				Secondary
			</Button>
			<Button {...args} variant="destructive">
				Destructive
			</Button>
			<Button {...args} variant="outline">
				Outline
			</Button>
			<Button {...args} variant="ghost">
				Ghost
			</Button>
			<Button {...args} variant="link">
				Link
			</Button>
		</div>
	),
};

export const Sizes: Story = {
	render: args => (
		<div className="flex flex-wrap items-center gap-3">
			<Button {...args} size="sm">
				Small
			</Button>
			<Button {...args} size="default">
				Default
			</Button>
			<Button {...args} size="lg">
				Large
			</Button>
		</div>
	),
};

export const Disabled: Story = { args: { disabled: true } };

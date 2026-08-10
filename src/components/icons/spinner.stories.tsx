import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "@/components/icons/spinner";
import { Button } from "@/components/ui/button";

const meta = {
	title: "Icons/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	args: { label: "Caricamento" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
	render: args => (
		<div className="flex items-center gap-6">
			<Spinner {...args} className="size-3" />
			<Spinner {...args} className="size-4" />
			<Spinner {...args} className="size-6" />
			<Spinner {...args} className="size-10" />
		</div>
	),
};

export const InAPendingButton: Story = {
	name: "In a pending button",
	render: args => (
		<div className="flex flex-wrap items-center gap-3">
			<Button disabled>
				<Spinner {...args} className="mr-2" />
				Salvataggio…
			</Button>
			<Button variant="outline" disabled>
				<Spinner {...args} className="mr-2" />
				Invio…
			</Button>
			<Button size="icon" variant="ghost" disabled aria-label="Caricamento">
				<Spinner {...args} />
			</Button>
		</div>
	),
};

export const OnTheBrandColour: Story = {
	name: "On the brand colour",
	render: args => (
		<div className="flex items-center gap-6">
			<Spinner {...args} className="text-primary size-6" />
			<Spinner {...args} className="text-muted-foreground size-6" />
			<div className="bg-primary flex items-center rounded-lg p-3">
				<Spinner {...args} className="text-primary-foreground size-6" />
			</div>
		</div>
	),
};

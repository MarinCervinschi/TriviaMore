import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from "./progress";

const meta = {
	title: "UI/Progress",
	component: Progress,
	tags: ["autodocs"],
	argTypes: {
		value: { control: { type: "range", min: 0, max: 100, step: 1 } },
	},
	args: { value: 60 },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<div className="w-80">
			<Progress {...args} />
		</div>
	),
};

export const Steps: Story = {
	render: () => (
		<div className="w-80 space-y-4">
			<div className="space-y-1">
				<p className="text-muted-foreground text-sm">Quiz iniziato</p>
				<Progress value={0} />
			</div>
			<div className="space-y-1">
				<p className="text-muted-foreground text-sm">A metà — 7 di 14 domande</p>
				<Progress value={50} />
			</div>
			<div className="space-y-1">
				<p className="text-muted-foreground text-sm">Quiz completato</p>
				<Progress value={100} />
			</div>
		</div>
	),
};

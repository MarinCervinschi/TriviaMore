import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClockFace } from "./clock-face";

const meta = {
	title: "Session Dialogs/ClockFace",
	component: ClockFace,
	tags: ["autodocs"],
	args: { minutes: 15 },
} satisfies Meta<typeof ClockFace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The sweep is the whole point: it has to read at a glance across the range the picker offers. */
export const EveryStep: Story = {
	name: "Ogni passo del selettore",
	render: () => (
		<div className="flex flex-wrap items-end gap-6">
			{[5, 10, 15, 20, 30, 45, 60, 90, 120, null].map(minutes => (
				<div key={String(minutes)} className="flex flex-col items-center gap-2">
					<ClockFace minutes={minutes} />
					<span className="text-muted-foreground text-2xs tabular-nums">
						{minutes === null ? "∞" : `${minutes}′`}
					</span>
				</div>
			))}
		</div>
	),
};

export const Sizes: Story = {
	name: "Misure",
	render: () => (
		<div className="flex items-end gap-6">
			{[32, 48, 64, 96].map(size => (
				<ClockFace key={size} minutes={45} size={size} />
			))}
		</div>
	),
};

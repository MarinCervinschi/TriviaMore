import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

const meta = {
	title: "UI/Slider",
	component: Slider,
	tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="w-80">
			<Slider defaultValue={[20]} max={30} step={1} />
			<p className="text-muted-foreground mt-2 text-sm">Numero di domande per quiz</p>
		</div>
	),
};

export const Range: Story = {
	render: () => (
		<div className="w-80">
			<Slider defaultValue={[18, 30]} max={30} min={18} step={1} />
			<p className="text-muted-foreground mt-2 text-sm">Voto minimo e massimo</p>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="w-80">
			<Slider defaultValue={[15]} max={30} step={1} disabled />
		</div>
	),
};

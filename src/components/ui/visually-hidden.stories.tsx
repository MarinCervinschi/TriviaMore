import type { Meta, StoryObj } from "@storybook/react-vite";

import { VisuallyHidden } from "./visually-hidden";

const meta = {
	title: "UI/VisuallyHidden",
	component: VisuallyHidden,
	tags: ["autodocs"],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2">
			<span aria-hidden>⚙️</span>
			<VisuallyHidden>Apri le impostazioni del quiz</VisuallyHidden>
		</button>
	),
};

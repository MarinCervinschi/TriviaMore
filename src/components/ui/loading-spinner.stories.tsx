import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingSpinner } from "./loading-spinner";

const meta = {
	title: "UI/LoadingSpinner",
	component: LoadingSpinner,
	tags: ["autodocs"],
	argTypes: {
		size: { control: "select", options: ["sm", "default", "lg"] },
	},
	args: { size: "default" },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-10">
			<LoadingSpinner size="sm" />
			<LoadingSpinner size="default" />
			<LoadingSpinner size="lg" />
		</div>
	),
};

export const WithText: Story = {
	args: { text: "Caricamento domande…" },
};

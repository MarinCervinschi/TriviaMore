import type { Meta, StoryObj } from "@storybook/react-vite";

import { quizFunnel } from "./fixtures";
import { FunnelChart } from "./funnel-chart";

const meta = {
	title: "Charts/FunnelChart",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every stage must be a subset of the one before it, otherwise the narrowing
 * shape claims a drop-off that did not happen.
 */
export const Default: Story = {
	render: () => (
		<FunnelChart
			title="Percorso di una domanda"
			description="Dalla prima visione al ripasso"
			stages={quizFunnel}
		/>
	),
};

export const Empty: Story = {
	render: () => (
		<FunnelChart
			title="Percorso di una domanda"
			stages={[]}
			emptyMessage="Nessuna sessione registrata."
		/>
	),
};

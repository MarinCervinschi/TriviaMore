import type { Meta, StoryObj } from "@storybook/react-vite";

import { quizFunnel } from "./fixtures";
import { FunnelChart } from "./funnel-chart";

const meta = {
	title: "Charts/FunnelChart",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

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

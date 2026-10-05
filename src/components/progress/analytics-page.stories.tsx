import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ExplorerMode, ExplorerPeriod } from "@/lib/user/metric-explorer";

import { AnalyticsView } from "./analytics-view";
import { ATTEMPTS, DAILY, TODAY } from "./fixtures";

const CONTENT_WIDTH = 1216;

function Framed({ width }: { width: number }) {
	const period: ExplorerPeriod = "year";
	const mode: ExplorerMode = "both";

	return (
		<div style={{ width }}>
			<AnalyticsView
				daily={DAILY}
				attempts={ATTEMPTS}
				today={TODAY}
				period={period}
				mode={mode}
			/>
		</div>
	);
}

const meta = {
	title: "Progress/Pagina Analytics",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	name: "Desktop (1216px)",
	render: () => <Framed width={CONTENT_WIDTH} />,
};

/** The same page at phone width, where the grid collapses to one column. */
export const Mobile: Story = {
	name: "Mobile (390px)",
	globals: { viewport: { value: "iphone6" } },
	render: () => <Framed width={358} />,
};

import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ExplorerMode, ExplorerPeriod } from "@/lib/user/metric-explorer";

import { AnalyticsView } from "./analytics-view";
import { ATTEMPTS, DAILY, MASTERY, TODAY } from "./fixtures";

/**
 * The page itself, at the width it really gets: the content column is 1216px —
 * the 1280px container less its padding, inside the rail's 90px gutter. The story
 * renders the component the route mounts, so what is judged here is what ships.
 */
const CONTENT_WIDTH = 1216;

function Framed({ width }: { width: number }) {
	const [period, setPeriod] = useState<ExplorerPeriod>("year");
	const [mode, setMode] = useState<ExplorerMode>("both");

	return (
		<div style={{ width }}>
			<AnalyticsView
				daily={DAILY}
				attempts={ATTEMPTS}
				mastery={MASTERY}
				today={TODAY}
				period={period}
				mode={mode}
				onPeriodChange={setPeriod}
				onModeChange={setMode}
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

/** La stessa pagina a larghezza telefono: la griglia collassa in colonna. */
export const Mobile: Story = {
	name: "Mobile (390px)",
	globals: { viewport: { value: "iphone6" } },
	render: () => <Framed width={358} />,
};

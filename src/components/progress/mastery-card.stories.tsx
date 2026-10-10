import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UserMastery } from "@/lib/user/types";

import { MASTERY as RICH } from "./fixtures";
import { MasteryCard } from "./mastery-card";
import { SpeedAccuracy } from "./speed-accuracy";

const NO_TIME: UserMastery = {
	...RICH,
	avgSecondsPerQuestion: null,
	sections: RICH.sections.map(s => ({ ...s, avgSeconds: null })),
};

const meta = {
	title: "Progress/MasteryCard",
	// Meta-level args, so the render-only stories typecheck.
	args: { mastery: RICH },
	component: MasteryCard,
	parameters: { layout: "fullscreen" },
	decorators: [
		Story => (
			<div className="container py-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof MasteryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = { args: { mastery: RICH } };

export const SenzaTempi: Story = {
	name: "Senza tempi",
	args: { mastery: NO_TIME },
};

const NARROW = 395;
const WIDE = 805;

export const Verticale: Story = {
	name: "Card verticale",
	render: () => (
		<div style={{ width: NARROW }}>
			<MasteryCard mastery={RICH} />
		</div>
	),
};

export const AccantoAlGrafico: Story = {
	name: "Accanto al grafico",
	render: () => (
		<div className="flex items-stretch gap-4" style={{ width: NARROW + WIDE + 16 }}>
			<div style={{ width: NARROW }}>
				<MasteryCard mastery={RICH} />
			</div>
			<div style={{ width: WIDE }}>
				<SpeedAccuracy sections={RICH.sections} />
			</div>
		</div>
	),
};

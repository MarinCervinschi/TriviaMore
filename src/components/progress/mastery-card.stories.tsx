import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UserMastery } from "@/lib/user/types";

import { MASTERY as RICH } from "./fixtures";
import { MasteryCard } from "./mastery-card";
import { SpeedAccuracy } from "./speed-accuracy";

// The same student, with attempts that were never timed: no per-question figure,
// and nothing to place on the speed axis.
const NO_TIME: UserMastery = {
	...RICH,
	avgSecondsPerQuestion: null,
	sections: RICH.sections.map(s => ({ ...s, avgSeconds: null })),
};

const meta = {
	title: "Progress/MasteryCard",
	// Meta-level args, so the render-only stories below typecheck without
	// restating a fixture they do not read.
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

// Le due larghezze che la pagina Analytics dà alle card di questa riga.
const NARROW = 395;
const WIDE = 805;

/** La larghezza vera che la pagina Analytics dà alla card. */
export const Verticale: Story = {
	name: "Card verticale",
	render: () => (
		<div style={{ width: NARROW }}>
			<MasteryCard mastery={RICH} />
		</div>
	),
};

/** La riga vera della pagina: le due card affiancate, per giudicare le altezze. */
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

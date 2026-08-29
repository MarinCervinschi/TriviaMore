import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UserMastery } from "@/lib/user/types";

import { MASTERY as RICH } from "./fixtures";
import { MasteryCard, MasteryPanel } from "./mastery-panel";
import { SpeedAccuracy } from "./speed-accuracy";

// The same student, with attempts that were never timed: no per-question figure,
// and nothing to place on the speed axis.
const NO_TIME: UserMastery = {
	...RICH,
	avgSecondsPerQuestion: null,
	sections: RICH.sections.map(s => ({ ...s, avgSeconds: null })),
	weakSections: RICH.weakSections.map(s => ({ ...s, avgSeconds: null })),
	strongSections: RICH.strongSections.map(s => ({ ...s, avgSeconds: null })),
};

const NO_SECTIONS: UserMastery = {
	...RICH,
	weakSections: [],
	strongSections: [],
};

const meta = {
	title: "Progress/MasteryPanel",
	// Meta-level args, so the render-only stories below typecheck without
	// restating a fixture they do not read.
	args: { mastery: RICH },
	component: MasteryPanel,
	parameters: { layout: "fullscreen" },
	decorators: [
		Story => (
			<div className="container py-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof MasteryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = { args: { mastery: RICH } };

export const SenzaTempi: Story = {
	name: "Senza tempi",
	args: { mastery: NO_TIME },
};

export const SenzaSezioni: Story = {
	name: "Senza sezioni classificate",
	args: { mastery: NO_SECTIONS },
};

export const SingolaEntita: Story = {
	name: "Singola entità (no liste)",
	args: { mastery: RICH, sections: false },
};

// Le due larghezze che la pagina Analytics dà alle card di questa riga.
const NARROW = 395;
const WIDE = 805;

/**
 * La stessa lettura in colonna: calibro sopra, barre sotto, aree da riprendere in
 * fondo — la forma che serve accanto a un grafico largo, dove non c'è spazio per
 * mettere calibro e barre affiancati.
 */
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

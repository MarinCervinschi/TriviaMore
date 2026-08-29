import type { Meta, StoryObj } from "@storybook/react-vite";

import { MASTERY } from "./fixtures";
import { SpeedAccuracy } from "./speed-accuracy";

// The width the card gets on the page: eight of twelve columns in the 1216px
// content area, 16px gaps.
const PAGE_WIDTH = 805;

const meta = {
	title: "Progress/Velocità e precisione",
	component: SpeedAccuracy,
	parameters: { layout: "padded" },
	args: { sections: MASTERY.sections },
	decorators: [
		Story => (
			<div style={{ width: PAGE_WIDTH }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SpeedAccuracy>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Il chip in alto a destra raggruppa davvero: sezione, insegnamento, corso. */
export const Default: Story = { name: "Per sezione" };

/** Un solo punto: le guide restano, ma non dividono più niente. */
export const UnaSezione: Story = {
	name: "Una sezione",
	args: { sections: MASTERY.sections.slice(0, 1) },
};

/** Nessun tempo registrato: il grafico non può collocare niente, e lo dice. */
export const SenzaTempi: Story = {
	name: "Senza tempi",
	args: { sections: MASTERY.sections.map(s => ({ ...s, avgSeconds: null })) },
};

/** Metà delle sezioni senza tempo: il footer conta quelle escluse. */
export const ConEsclusioni: Story = {
	name: "Con esclusioni",
	args: {
		sections: MASTERY.sections.map((section, index) =>
			index % 2 === 0 ? { ...section, avgSeconds: null } : section
		),
	},
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConsistencyCard } from "./consistency-card";
import { ATTEMPTS, DAILY, TODAY } from "./fixtures";
import { WhenYouStudyCard } from "./study-rhythm";

// The two widths this row gets on the page: eight columns and four.
const WIDE = 805;
const NARROW = 395;

const meta = {
	title: "Progress/Costanza",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	name: "Costanza",
	render: () => (
		<div style={{ width: WIDE }}>
			<ConsistencyCard daily={DAILY} attempts={ATTEMPTS} today={TODAY} />
		</div>
	),
};

export const Quando: Story = {
	name: "Quando studi",
	render: () => (
		<div style={{ width: NARROW }}>
			<WhenYouStudyCard attempts={ATTEMPTS} today={TODAY} />
		</div>
	),
};

/** La riga della pagina: la heatmap larga e l'istogramma stretto, affiancati. */
export const LaRiga: Story = {
	name: "La riga",
	render: () => (
		<div className="flex items-stretch gap-4" style={{ width: WIDE + NARROW + 16 }}>
			<div style={{ width: WIDE }}>
				<ConsistencyCard daily={DAILY} attempts={ATTEMPTS} today={TODAY} />
			</div>
			<div style={{ width: NARROW }}>
				<WhenYouStudyCard attempts={ATTEMPTS} today={TODAY} />
			</div>
		</div>
	),
};

/** Un utente nuovo: nessun quadretto, nessuna serie, e le cifre restano trattini. */
export const Vuoto: Story = {
	render: () => (
		<div className="flex items-stretch gap-4" style={{ width: WIDE + NARROW + 16 }}>
			<div style={{ width: WIDE }}>
				<ConsistencyCard daily={[]} attempts={[]} today={TODAY} />
			</div>
			<div style={{ width: NARROW }}>
				<WhenYouStudyCard attempts={[]} today={TODAY} />
			</div>
		</div>
	),
};

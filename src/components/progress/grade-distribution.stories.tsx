import { DownloadIcon } from "@solar-icons/react/linear/download";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { GradeDistribution } from "./grade-distribution";

// A fixed spread, so the ring never reshuffles between two looks.
const SCORES = [
	33, 32, 32, 31, 31, 31, 30, 30, 30, 30, 29, 29, 29, 28, 28, 28, 27, 27, 26, 26, 25,
	24, 24, 23, 22, 19, 17,
];

// The width the card actually gets on the page: the content column is 1216px
// (1280 container less its padding, inside the rail's 90px gutter), twelve
// columns with a 16px gap, and this card spans four of them.
const PAGE_WIDTH = 395;

const meta = {
	title: "Progress/Distribuzione voti",
	component: GradeDistribution,
	parameters: { layout: "padded" },
	args: {
		scores: SCORES,
		actions: (
			<Button variant="outline" size="icon" aria-label="Scarica i dati">
				<DownloadIcon className="size-4" />
			</Button>
		),
	},
	decorators: [
		Story => (
			<div style={{ width: PAGE_WIDTH }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof GradeDistribution>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Tutte le bande" };

/** A student who never dropped below 27: two slices, and no empty legend rows. */
export const DueBande: Story = {
	name: "Due bande",
	args: { scores: [30, 29, 28, 31, 32, 30, 27, 33] },
};

/** L'altro anello: fette staccate con estremi arrotondati, senza il totale in mezzo. */
export const Petali: Story = {
	name: "Variante petals",
	args: { variant: "petals" },
};

export const Vuoto: Story = { args: { scores: [] } };

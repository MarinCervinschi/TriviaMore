import { DownloadIcon } from "@solar-icons/react/linear/download";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { GradeDistribution } from "./grade-distribution";

const SCORES = [
	33, 32, 32, 31, 31, 31, 30, 30, 30, 30, 29, 29, 29, 28, 28, 28, 27, 27, 26, 26, 25,
	24, 24, 23, 22, 19, 17,
];

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

export const DueBande: Story = {
	name: "Due bande",
	args: { scores: [30, 29, 28, 31, 32, 30, 27, 33] },
};

/** The other ring, with detached rounded slices and no total in the middle. */
export const Petali: Story = {
	name: "Variante petals",
	args: { variant: "petals" },
};

export const Vuoto: Story = { args: { scores: [] } };

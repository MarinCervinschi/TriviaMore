import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScatterPlot } from "./scatter-plot";

// A fixed spread: no Math.random, so two looks compare.
const DATA = [
	{ key: "a", label: "Alpha", x: 12, y: 79, weight: 38 },
	{ key: "b", label: "Bravo", x: 18, y: 96, weight: 120 },
	{ key: "c", label: "Charlie", x: 22, y: 54, weight: 48 },
	{ key: "d", label: "Delta", x: 27, y: 91, weight: 74 },
	{ key: "e", label: "Echo", x: 33, y: 88, weight: 92 },
	{ key: "f", label: "Foxtrot", x: 41, y: 67, weight: 64 },
	{ key: "g", label: "Golf", x: 49, y: 84, weight: 56 },
];

const meta = {
	title: "Charts/ScatterPlot",
	component: ScatterPlot,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	args: {
		title: "Velocità e precisione",
		description: "Ogni punto è un soggetto; l'area del punto è il suo peso",
		data: DATA,
		xLabel: "Tempo per domanda",
		yLabel: "Accuratezza",
		weightLabel: "Risposte",
		xFormatter: (value: number) => `${value}s`,
		yFormatter: (value: number) => `${value}%`,
		yDomain: [50, 100],
		guides: { x: 28, y: 82 },
	},
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Without the two guides the quadrants disappear and only the cloud is left. */
export const SenzaGuide: Story = {
	name: "Senza guide",
	args: { guides: undefined },
};

/** Every mark the same size: the weight stops being a channel. */
export const SenzaPesi: Story = {
	name: "Senza pesi",
	args: { data: DATA.map(point => ({ ...point, weight: undefined })) },
};

export const Vuoto: Story = {
	args: { data: [], emptyMessage: "Niente da mostrare in questo periodo." },
};

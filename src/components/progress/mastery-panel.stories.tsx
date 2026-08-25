import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UserMastery } from "@/lib/user/types";

import { MasteryPanel } from "./mastery-panel";

const RICH: UserMastery = {
	totalAnswers: 214,
	avgSecondsPerQuestion: 34,
	byDifficulty: [
		{ key: "EASY", total: 80, correct: 72 },
		{ key: "MEDIUM", total: 100, correct: 61 },
		{ key: "HARD", total: 34, correct: 12 },
	],
	weakSections: [
		{
			sectionId: "s1",
			sectionName: "Integrali impropri",
			courseCode: "II",
			className: "Analisi Matematica I",
			path: null,
			total: 22,
			correct: 8,
			avgSeconds: 58,
		},
		{
			sectionId: "s2",
			sectionName: "Diagonalizzazione",
			courseCode: "II",
			className: "Geometria e Algebra",
			path: null,
			total: 15,
			correct: 7,
			avgSeconds: 47,
		},
	],
	strongSections: [
		{
			sectionId: "s3",
			sectionName: "Limiti notevoli",
			courseCode: "II",
			className: "Analisi Matematica I",
			path: null,
			total: 30,
			correct: 29,
			avgSeconds: 21,
		},
		{
			sectionId: "s4",
			sectionName: "Prodotto scalare",
			courseCode: "II",
			className: "Geometria e Algebra",
			path: null,
			total: 18,
			correct: 16,
			avgSeconds: 26,
		},
	],
};

// A user whose attempts were never timed: no per-question time surfaces.
const NO_TIME: UserMastery = {
	...RICH,
	avgSecondsPerQuestion: null,
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

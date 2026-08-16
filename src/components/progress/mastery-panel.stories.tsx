import type { Meta, StoryObj } from "@storybook/react-vite";

import type { UserMastery } from "@/lib/user/types";

import { MasteryPanel } from "./mastery-panel";

const RICH: UserMastery = {
	totalAnswers: 214,
	byDifficulty: [
		{ key: "EASY", total: 80, correct: 72 },
		{ key: "MEDIUM", total: 100, correct: 61 },
		{ key: "HARD", total: 34, correct: 12 },
	],
	weakSections: [
		{
			sectionId: "s1",
			sectionName: "Integrali impropri",
			courseName: "Analisi Matematica I",
			path: null,
			total: 22,
			correct: 8,
		},
		{
			sectionId: "s2",
			sectionName: "Diagonalizzazione",
			courseName: "Geometria e Algebra",
			path: null,
			total: 15,
			correct: 7,
		},
	],
	strongSections: [
		{
			sectionId: "s3",
			sectionName: "Limiti notevoli",
			courseName: "Analisi Matematica I",
			path: null,
			total: 30,
			correct: 29,
		},
		{
			sectionId: "s4",
			sectionName: "Prodotto scalare",
			courseName: "Geometria e Algebra",
			path: null,
			total: 18,
			correct: 16,
		},
	],
};

const NO_SECTIONS: UserMastery = {
	...RICH,
	weakSections: [],
	strongSections: [],
};

const meta = {
	title: "Progress/MasteryPanel",
	component: MasteryPanel,
	parameters: { layout: "padded" },
} satisfies Meta<typeof MasteryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = { args: { mastery: RICH } };

export const SenzaSezioni: Story = {
	name: "Senza sezioni classificate",
	args: { mastery: NO_SECTIONS },
};

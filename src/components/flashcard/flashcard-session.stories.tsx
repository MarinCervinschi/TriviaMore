import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { FLASHCARD_QUESTIONS } from "@/components/quiz/fixtures";

import { FlashcardQuestionCard } from "./flashcard-question-card";
import { FlashcardResults } from "./flashcard-results";

const meta = {
	title: "Flashcard/Sessione",
	parameters: { layout: "padded", session: { role: "STUDENT" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Card({ index, flipped }: { index: number; flipped?: boolean }) {
	const [isFlipped, setFlipped] = useState(flipped ?? false);
	return (
		<FlashcardQuestionCard
			question={FLASHCARD_QUESTIONS[index]}
			questionNumber={index + 1}
			isFlipped={isFlipped}
			onFlip={() => setFlipped(f => !f)}
		/>
	);
}

export const Card_: Story = {
	name: "La carta",
	render: () => (
		<div className="grid max-w-5xl gap-6 lg:grid-cols-2">
			<Card index={0} />
			<Card index={0} flipped />
		</div>
	),
};

export const LongAnswer: Story = {
	name: "Risposta lunga",
	render: () => (
		<div className="max-w-2xl">
			<Card index={2} flipped />
		</div>
	),
};

export const Results: Story = {
	name: "Riepilogo finale",
	parameters: { layout: "fullscreen" },
	render: () => (
		<FlashcardResults
			questions={FLASHCARD_QUESTIONS}
			studiedCards={new Set([0, 2])}
			timeSpent={412_000}
			sectionName="Alberi binari di ricerca"
			onExit={() => {}}
			onRetry={() => {}}
		/>
	),
};

export const NothingStudied: Story = {
	name: "Nessuna carta girata",
	parameters: { layout: "fullscreen" },
	render: () => (
		<FlashcardResults
			questions={FLASHCARD_QUESTIONS}
			studiedCards={new Set()}
			timeSpent={9_000}
			sectionName="Alberi binari di ricerca"
			onExit={() => {}}
			onRetry={() => {}}
		/>
	),
};

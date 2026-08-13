import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { FlashcardHeader } from "./flashcard-header";
import { FlashcardNavigation } from "./flashcard-navigation";
import { FlashcardProgress } from "./flashcard-progress";
import { FlashcardSidebarContent } from "./flashcard-sidebar";

// The frame around a flashcard session. Unlike the quiz there is no timer and no answer: progress is
// how many cards you have turned.
const meta = {
	title: "Flashcard/Chrome",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Header: Story = {
	name: "Intestazione",
	render: () => (
		<div className="space-y-6">
			<FlashcardHeader
				questionIndex={3}
				totalQuestions={24}
				studiedCount={7}
				sidebarOpen={false}
				onToggleSidebar={noop}
				onExit={noop}
			/>
			<FlashcardHeader
				questionIndex={0}
				totalQuestions={1}
				studiedCount={0}
				sidebarOpen
				onToggleSidebar={noop}
				onExit={noop}
			/>
		</div>
	),
};

export const Progress: Story = {
	name: "Avanzamento",
	render: () => (
		<div className="max-w-md space-y-6">
			{[0, 7, 24].map(studied => (
				<FlashcardProgress key={studied} studied={studied} total={24} />
			))}
		</div>
	),
};

export const Navigation: Story = {
	name: "Navigazione",
	render: () => (
		<div className="max-w-2xl space-y-8">
			{[0, 11, 23].map(index => (
				<FlashcardNavigation
					key={index}
					currentIndex={index}
					totalQuestions={24}
					onPrevious={noop}
					onNext={noop}
					onComplete={noop}
				/>
			))}
		</div>
	),
};

function Sidebar() {
	const [current, setCurrent] = useState(4);
	const studied = new Set([0, 1, 2, 3, 5, 9]);
	return (
		<div className="max-w-64">
			<FlashcardSidebarContent
				totalQuestions={24}
				currentIndex={current}
				studiedCards={studied}
				onJump={setCurrent}
			/>
		</div>
	);
}

export const Sidebar_: Story = {
	name: "Elenco delle carte",
	render: () => <Sidebar />,
};

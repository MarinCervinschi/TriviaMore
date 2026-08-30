import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { QuizHeader } from "./quiz-header";
import { QuizNavigation } from "./quiz-navigation";
import { QuizProgress } from "./quiz-progress";
import { QuizSidebar, QuizSidebarContent } from "./quiz-sidebar";
import { QuizTimer } from "./quiz-timer";

// The frame around a quiz question: where you are, how long is left, and how to move. The timer runs
// for real, so leaving a story open counts down.
const meta = {
	title: "Quiz/Chrome",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Header: Story = {
	name: "Intestazione",
	render: () => (
		<div className="space-y-6">
			<QuizHeader
				questionIndex={3}
				totalQuestions={24}
				timeLimit={15}
				context={{ kind: "exam", name: "Algoritmi e Strutture Dati" }}
				sidebarOpen={false}
				onToggleSidebar={noop}
				onTimeUp={noop}
				onExit={noop}
			/>
			<QuizHeader
				questionIndex={0}
				totalQuestions={1}
				timeLimit={null}
				context={{ kind: "section", name: "Alberi binari di ricerca" }}
				sidebarOpen
				onToggleSidebar={noop}
				onTimeUp={noop}
				onExit={noop}
			/>
			<QuizHeader
				questionIndex={11}
				totalQuestions={30}
				timeLimit={20}
				sidebarOpen={false}
				onToggleSidebar={noop}
				onTimeUp={noop}
				onExit={noop}
			/>
			<p className="text-muted-foreground text-xs">
				Il secondo è senza limite di tempo e con una sola domanda: il cronometro conta
				in su invece di scalare. Il terzo è senza contesto, come restano le sessioni che
				non sanno da dove arrivano.
			</p>
		</div>
	),
};

export const Progress: Story = {
	name: "Avanzamento",
	render: () => (
		<div className="max-w-md space-y-6">
			{[
				[1, 24],
				[12, 24],
				[24, 24],
			].map(([current, total]) => (
				<QuizProgress key={current} current={current} total={total} />
			))}
		</div>
	),
};

function Nav({ index, total }: { index: number; total: number }) {
	return (
		<QuizNavigation
			currentIndex={index}
			totalQuestions={total}
			onPrevious={noop}
			onNext={noop}
			onComplete={noop}
		/>
	);
}

/** First, middle, last and mid-submit: the three ends of the walk plus the state that blocks it. */
export const Navigation: Story = {
	name: "Navigazione",
	render: () => (
		<div className="max-w-2xl space-y-8">
			<Nav index={0} total={24} />
			<Nav index={11} total={24} />
			<Nav index={23} total={24} />
			<QuizNavigation
				currentIndex={23}
				totalQuestions={24}
				onPrevious={noop}
				onNext={noop}
				onComplete={noop}
				isCompleting
			/>
		</div>
	),
};

function Sidebar() {
	const [current, setCurrent] = useState(4);
	const answered = Array.from({ length: 24 }, (_, i) => i < 7 || i === 9);
	return (
		<div className="max-w-64">
			<QuizSidebarContent
				totalQuestions={24}
				currentIndex={current}
				answeredQuestions={answered}
				onJump={setCurrent}
			/>
		</div>
	);
}

export const Sidebar_: Story = {
	name: "Elenco delle domande",
	render: () => <Sidebar />,
};

/** The same list inside its aside, which is what the play route mounts from `lg` up. */
export const SidebarAside: Story = {
	name: "La colonna laterale",
	parameters: { layout: "fullscreen" },
	render: () => (
		<div className="flex h-96">
			<QuizSidebar
				totalQuestions={24}
				currentIndex={7}
				answeredQuestions={Array.from({ length: 24 }, (_, i) => i < 9)}
				onJump={() => {}}
			/>
			<div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
				la domanda sta qui
			</div>
		</div>
	),
};

export const Timer: Story = {
	name: "Timer",
	render: () => (
		<div className="flex flex-wrap items-center gap-10">
			<QuizTimer timeLimitMinutes={15} onTimeUp={noop} />
			<QuizTimer timeLimitMinutes={1} onTimeUp={noop} />
			<QuizTimer timeLimitMinutes={null} onTimeUp={noop} />
		</div>
	),
};

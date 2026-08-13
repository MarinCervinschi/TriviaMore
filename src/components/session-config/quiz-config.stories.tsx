import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { TIME_STEPS } from "@/lib/quiz/constants";

import { EVAL_MODES } from "./fixtures";
import { FlashcardConfigFields, FlashcardSummary } from "./flashcard-config";
import { QuizConfigFields, QuizSummary } from "./quiz-config";
import { SummaryPanel } from "./summary-panel";

// The form and its live summary, side by side as the dialog renders them, so a change to one is
// visibly a change to the other.
const meta = {
	title: "Session Dialogs/Config fields",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function QuizHarness({ max, modes }: { max: number; modes?: typeof EVAL_MODES }) {
	const [questionCount, setQuestionCount] = useState(Math.min(24, max));
	const [timeStepIndex, setTimeStepIndex] = useState(2);
	const [evalModeId, setEvalModeId] = useState(modes?.[0]?.id);
	const selected = modes?.find(m => m.id === evalModeId);
	const timeLimit =
		timeStepIndex < TIME_STEPS.length ? TIME_STEPS[timeStepIndex] : null;

	return (
		<div className="grid gap-8 md:grid-cols-2">
			<div className="space-y-5">
				<QuizConfigFields
					questionCount={questionCount}
					setQuestionCount={setQuestionCount}
					timeStepIndex={timeStepIndex}
					setTimeStepIndex={setTimeStepIndex}
					evalModeId={evalModeId}
					setEvalModeId={setEvalModeId}
					evalModes={modes}
					selectedEvalMode={selected}
					maxQuestions={max}
				/>
			</div>
			<SummaryPanel footerTip="Il riepilogo segue il form dal vivo.">
				<QuizSummary
					timeLimit={timeLimit}
					questionCount={questionCount}
					maxQuestions={max}
					selectedEvalMode={selected}
				/>
			</SummaryPanel>
		</div>
	);
}

export const Quiz: Story = {
	name: "Quiz",
	render: () => <QuizHarness max={142} modes={EVAL_MODES} />,
};

/** Fewer than two modes and the picker hides itself — one choice is not a choice. */
export const QuizSingleMode: Story = {
	name: "Quiz — una sola modalità",
	render: () => <QuizHarness max={40} modes={[EVAL_MODES[0]]} />,
};

function FlashcardHarness({ max }: { max: number }) {
	const [cardCount, setCardCount] = useState(Math.min(20, max));
	return (
		<div className="grid gap-8 md:grid-cols-2">
			<div className="space-y-5">
				<FlashcardConfigFields
					cardCount={cardCount}
					setCardCount={setCardCount}
					maxCards={max}
				/>
			</div>
			<SummaryPanel footerTip="Il riepilogo segue il form dal vivo.">
				<FlashcardSummary cardCount={cardCount} maxCards={max} />
			</SummaryPanel>
		</div>
	);
}

export const Flashcard: Story = {
	name: "Flashcard",
	render: () => <FlashcardHarness max={142} />,
};

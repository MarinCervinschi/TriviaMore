import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { EVAL_MODES_SEED } from "@/components/session-config/fixtures";
import { Button } from "@/components/ui/button";

import { StartExamDialog } from "./start-exam-dialog";

const meta = {
	title: "Session Dialogs/StartExamDialog",
	parameters: { layout: "centered", queryData: EVAL_MODES_SEED },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({ quiz, cards }: { quiz: number; cards: number }) {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri il dialog</Button>}
			<StartExamDialog
				open={open}
				onOpenChange={setOpen}
				sectionId="story-section"
				maxQuizQuestions={quiz}
				maxFlashcardQuestions={cards}
			/>
		</>
	);
}

export const Both: Story = {
	name: "Quiz e flashcard",
	render: () => <Harness quiz={142} cards={142} />,
};

/** Only one half available — the tab for the other should not offer itself. */
export const QuizOnly: Story = {
	name: "Solo quiz",
	render: () => <Harness quiz={40} cards={0} />,
};

export const FlashcardOnly: Story = {
	name: "Solo flashcard",
	render: () => <Harness quiz={0} cards={40} />,
};

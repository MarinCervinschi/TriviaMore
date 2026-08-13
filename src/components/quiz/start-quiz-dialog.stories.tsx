import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { EVAL_MODES_SEED } from "@/components/session-config/fixtures";
import { Button } from "@/components/ui/button";

import { StartQuizDialog } from "./start-quiz-dialog";

const meta = {
	title: "Session Dialogs/Quiz",
	parameters: { layout: "centered", queryData: EVAL_MODES_SEED },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({ maxQuestions }: { maxQuestions: number }) {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri il dialog</Button>}
			<StartQuizDialog
				open={open}
				onOpenChange={setOpen}
				sectionId="story-section"
				maxQuestions={maxQuestions}
			/>
		</>
	);
}

export const Default: Story = {
	name: "Sezione da 142 domande",
	render: () => <Harness maxQuestions={142} />,
};

export const Small: Story = {
	name: "Sezione da 3 domande",
	render: () => <Harness maxQuestions={3} />,
};

/** No evaluation modes seeded: the picker and its info card should simply not appear. */
export const NoEvalModes: Story = {
	name: "Senza modalità di valutazione",
	parameters: { queryData: [] },
	render: () => <Harness maxQuestions={40} />,
};

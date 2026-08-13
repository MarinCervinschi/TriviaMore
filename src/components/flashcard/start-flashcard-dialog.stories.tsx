import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { StartFlashcardDialog } from "./start-flashcard-dialog";

const meta = {
	title: "Session Dialogs/StartFlashcardDialog",
	parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({ maxQuestions }: { maxQuestions: number }) {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri il dialog</Button>}
			<StartFlashcardDialog
				open={open}
				onOpenChange={setOpen}
				sectionId="story-section"
				maxQuestions={maxQuestions}
			/>
		</>
	);
}

export const Default: Story = {
	name: "Sezione da 142 carte",
	render: () => <Harness maxQuestions={142} />,
};

export const Small: Story = {
	name: "Sezione da 3 carte",
	render: () => <Harness maxQuestions={3} />,
};

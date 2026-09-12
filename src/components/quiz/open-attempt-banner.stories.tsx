import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { OPEN_ATTEMPT } from "@/components/session-config/fixtures";
import { Button } from "@/components/ui/button";

import { OpenAttemptBanner, OpenAttemptDialog } from "./open-attempt-banner";

const meta = {
	title: "Quiz/Tentativo aperto",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cancelling really calls the server function, which the Storybook stub throws from. */
export const Banner: Story = {
	name: "Il banner in dashboard",
	render: () => <OpenAttemptBanner attempt={OPEN_ATTEMPT} />,
};

export const Exam: Story = {
	name: "Il banner per una simulazione",
	render: () => (
		<OpenAttemptBanner
			attempt={{ ...OPEN_ATTEMPT, quizMode: "EXAM_SIMULATION", timeLimit: 60 }}
		/>
	),
};

function DialogHarness() {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri il dialog</Button>}
			<OpenAttemptDialog attempt={OPEN_ATTEMPT} open={open} onOpenChange={setOpen} />
		</>
	);
}

export const Blocking: Story = {
	name: "Il dialog che blocca un nuovo quiz",
	render: () => <DialogHarness />,
};

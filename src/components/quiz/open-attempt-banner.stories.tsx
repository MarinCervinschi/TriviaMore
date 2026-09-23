import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { OPEN_ATTEMPT } from "@/components/session-config/fixtures";
import { Button } from "@/components/ui/button";

import {
	OpenAttemptBanner,
	OpenAttemptDialog,
	OpenAttemptStatus,
} from "./open-attempt-banner";

const meta = {
	title: "Quiz/Tentativo aperto",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cancelling really calls the server function, which the Storybook stub throws from. */
export const Banner: Story = {
	name: "Il banner, prima di una simulazione",
	render: () => <OpenAttemptBanner attempt={OPEN_ATTEMPT} />,
};

/** The dashboard form, inside the bar that hosts it. */
export const Status: Story = {
	name: "La riga di stato",
	render: () => (
		<div className="bg-muted flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3.5 py-2 text-sm">
			<OpenAttemptStatus attempt={OPEN_ATTEMPT} />
		</div>
	),
};

export const Exam: Story = {
	name: "Il banner per una simulazione",
	render: () => (
		<OpenAttemptBanner attempt={{ ...OPEN_ATTEMPT, quizMode: "EXAM_SIMULATION" }} />
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

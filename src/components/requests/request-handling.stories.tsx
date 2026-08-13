import { useState } from "react";

import { FlagIcon } from "@solar-icons/react/linear/flag";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { ConfigBadge } from "./config-badge";
import { HandleRequestDialog } from "./handle-request-dialog";
import { PresetReplies } from "./preset-replies";
import { ReportButton } from "./report-button";
import { ReportQuestionDialog } from "./report-question-dialog";

// The other half: reporting a question, and an admin acting on a proposal. Both reach mutations through
// server functions, so submitting from a story throws by design — the stub says so out loud.
const meta = {
	title: "Requests/Handling",
	parameters: { layout: "padded", session: { role: "SUPERADMIN" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Handle() {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri</Button>}
			<HandleRequestDialog requestId="req-1" open={open} onOpenChange={setOpen} />
		</>
	);
}

export const Handle_: Story = {
	name: "Gestire una proposta",
	parameters: { layout: "centered" },
	render: () => <Handle />,
};

function Presets() {
	const [text, setText] = useState("");
	return (
		<div className="max-w-2xl space-y-4">
			<PresetReplies
				presets={[
					"Grazie, approvata così com'è.",
					"Servono le fonti per almeno metà delle domande.",
					"Alcune domande sono duplicate di quelle già presenti.",
				]}
				onPick={setText}
			/>
			<p className="text-muted-foreground text-sm">scelto: {text || "(niente)"}</p>
		</div>
	);
}

/** A canned reply is a starting point, not a send: picking one fills the field and stops there. */
export const Presets_: Story = {
	name: "Le risposte pronte",
	render: () => <Presets />,
};

function Report({ long }: { long?: boolean }) {
	const [open, setOpen] = useState(true);
	const content = long
		? "Quali fra le seguenti strutture dati garantiscono un accesso in tempo logaritmico, e per ciascuna di esse quale invariante deve essere mantenuta perché la garanzia valga anche nel caso peggiore?"
		: "Complessità del merge sort?";
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri</Button>}
			<ReportQuestionDialog
				questionId="q-1"
				questionContent={content}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}

export const ReportDialog: Story = {
	name: "Segnalare una domanda",
	parameters: { layout: "centered" },
	render: () => <Report />,
};

/** A long stem: the dialog quotes the question, so this is where it has to wrap rather than overflow. */
export const ReportLong: Story = {
	name: "Segnalare, domanda lunga",
	parameters: { layout: "centered" },
	render: () => <Report long />,
};

export const Trigger: Story = {
	name: "Il bottone di segnalazione",
	render: () => (
		<div className="flex items-center gap-6">
			<ReportButton questionId="q-1" questionContent="Complessità del merge sort?" />
			<span className="text-muted-foreground text-sm">
				Da disconnesso non si rende affatto.
			</span>
		</div>
	),
};

export const TriggerSignedOut: Story = {
	name: "Il bottone, da disconnesso",
	parameters: { session: null },
	render: () => (
		<div className="flex items-center gap-6">
			<ReportButton questionId="q-1" questionContent="Complessità del merge sort?" />
			<span className="text-muted-foreground text-sm">
				Sopra non c&apos;è nulla, ed è voluto.
			</span>
		</div>
	),
};

/** The shared pill both request badges are built on — colour and icon come from the caller's map. */
export const Badge: Story = {
	name: "La pill di configurazione",
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<ConfigBadge
				label="Nuova sezione"
				className="border-chart-2/30 bg-chart-2/10 text-chart-2-ink"
			/>
			<ConfigBadge
				label="Segnalazione"
				icon={FlagIcon}
				className="border-chart-1/30 bg-chart-1/10 text-chart-1-ink"
			/>
			<ConfigBadge
				label="In attesa"
				className="border-warning/30 bg-warning/10 text-warning"
			/>
		</div>
	),
};

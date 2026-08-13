import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { SessionDialogColumn, SessionDialogShell } from "./session-dialog";
import { Eyebrow, MetricBlock } from "./summary-blocks";
import { SummaryPanel } from "./summary-panel";

// The shell and the column every session dialog is built from — the chrome without the config.
const meta = {
	title: "Session Dialogs/Shell",
	parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({ isPending = false }: { isPending?: boolean }) {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri</Button>}
			<SessionDialogShell open={open} onOpenChange={setOpen}>
				<SessionDialogColumn
					title="Configura il quiz"
					description="Scegli quante domande, quanto tempo e come si valuta."
					submitLabel="Inizia"
					onSubmit={() => setOpen(false)}
					onCancel={() => setOpen(false)}
					isPending={isPending}
				>
					<p className="text-muted-foreground text-sm">
						Qui vanno i campi del form; questa storia mostra solo la cornice.
					</p>
				</SessionDialogColumn>
				<SummaryPanel footerTip="Puoi cambiare tutto prima di iniziare.">
					<Eyebrow>Riepilogo</Eyebrow>
					<MetricBlock eyebrow="Domande" value={24} total={142} showBar />
				</SummaryPanel>
			</SessionDialogShell>
		</>
	);
}

export const Default: Story = { render: () => <Harness /> };

/** Mid-submit: the action has to say it is working and stop accepting a second click. */
export const Pending: Story = { name: "In invio", render: () => <Harness isPending /> };

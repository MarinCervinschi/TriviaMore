import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/jobs/")({
	component: RunsPage,
});

function RunsPage() {
	return (
		<ConsolePage
			title="Esecuzioni"
			description="Ogni esecuzione dei job, con stato, durata e riepilogo del risultato."
		>
			<ComingSoon
				icon={ChecklistMinimalisticIcon}
				title="Lo storico delle esecuzioni"
				description="Arriva con il worker e pg-boss: avvio manuale, dry-run, log su Seq."
				issue={195}
			/>
		</ConsolePage>
	);
}

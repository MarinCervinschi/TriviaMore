import { TransferHorizontalIcon } from "@solar-icons/react/linear/transfer-horizontal";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/staging/")({
	component: DiffPage,
});

function DiffPage() {
	return (
		<ConsolePage
			title="Differenze"
			description="Cosa cambierebbe in produzione, tabella per tabella."
		>
			<ComingSoon
				icon={TransferHorizontalIcon}
				title="Il diff fra staging e produzione"
				description="Aggiunte, aggiornamenti e rimozioni per ogni tabella derivata dalle fonti."
				issue={196}
			/>
		</ConsolePage>
	);
}

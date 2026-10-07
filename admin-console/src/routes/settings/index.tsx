import { PlugCircleIcon } from "@solar-icons/react/linear/plug-circle";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/settings/")({
	component: ConnectionsPage,
});

function ConnectionsPage() {
	return (
		<ConsolePage
			title="Connessioni"
			description="I database e i servizi a cui la console è collegata."
		>
			<ComingSoon
				icon={PlugCircleIcon}
				title="Le connessioni"
				description="Staging in lettura e scrittura, produzione in sola lettura, Seq per i log."
				issue={194}
			/>
		</ConsolePage>
	);
}

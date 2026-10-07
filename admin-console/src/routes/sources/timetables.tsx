import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/sources/timetables")({
	component: TimetablesPage,
});

function TimetablesPage() {
	return (
		<ConsolePage
			title="Orari"
			description="Le lezioni da EasyAcademy e dalle pagine di ingegneria."
		>
			<ComingSoon
				icon={ClockCircleIcon}
				title="Da integrare"
				description="Lo spike misura la copertura delle due fonti e decide il modello dati delle lezioni."
				issue={191}
			/>
		</ConsolePage>
	);
}

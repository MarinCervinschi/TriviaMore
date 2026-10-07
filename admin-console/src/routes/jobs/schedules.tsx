import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/jobs/schedules")({
	component: SchedulesPage,
});

function SchedulesPage() {
	return (
		<ConsolePage
			title="Pianificazioni"
			description="Quando gira ogni job, e la prossima esecuzione prevista."
		>
			<ComingSoon
				icon={CalendarIcon}
				title="Le pianificazioni"
				description="Le frequenze dipendono dalle fonti: il catalogo cambia una volta l'anno, gli orari ogni giorno."
				issue={195}
			/>
		</ConsolePage>
	);
}

import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/sources/exams")({
	component: ExamsPage,
});

function ExamsPage() {
	return (
		<ConsolePage
			title="Appelli"
			description="Gli appelli d'esame dalla bacheca pubblica di Esse3."
		>
			<ComingSoon
				icon={CalendarIcon}
				title="Da integrare"
				description="Lo spike verifica se la bacheca si può importare e con quale copertura."
				issue={192}
			/>
		</ConsolePage>
	);
}

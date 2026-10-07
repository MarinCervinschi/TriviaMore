import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/sources/syllabi")({
	component: SyllabiPage,
});

function SyllabiPage() {
	return (
		<ConsolePage
			title="Programmi"
			description="I syllabus ufficiali degli insegnamenti, dall'offerta più recente che li pubblica."
		>
			<ComingSoon
				icon={DocumentTextIcon}
				title="La copertura dei programmi"
				description="Gli insegnamenti con e senza un programma ufficiale, e l'anno da cui viene ciascuno."
				issue={197}
			/>
		</ConsolePage>
	);
}

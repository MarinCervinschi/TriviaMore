import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "~/components/coming-soon";
import { ConsolePage } from "~/components/console-page";

export const Route = createFileRoute("/sources/catalog")({
	component: CatalogPage,
});

function CatalogPage() {
	return (
		<ConsolePage
			title="Corsi e piani"
			description="Il catalogo CINECA: corsi, piani per coorte, curriculum e gruppi a scelta."
		>
			<ComingSoon
				icon={DiplomaIcon}
				title="Lo stato del catalogo"
				description="Quanti corsi, coorti e righe di piano abbiamo, e l'ultimo diff con la sorgente."
				issue={197}
			/>
		</ConsolePage>
	);
}

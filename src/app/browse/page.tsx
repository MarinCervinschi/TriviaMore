import BrowsePageComponent from "@/components/pages/Browse";
import { BrowseService } from "@/lib/services";
import { BrowseTreeResponse } from "@/lib/types/browse.types";

export default async function BrowsePage() {
	const data: BrowseTreeResponse = await BrowseService.getInitialTree();

	return <BrowsePageComponent departments={data.departments} />;
}

export async function generateMetadata() {
	return {
		title: "Esplora Corsi - TriviaMore",
		description:
			"Sfoglia tutti i corsi universitari disponibili su TriviaMore. Trova quiz e materiali di studio organizzati per dipartimento e corso.",
		keywords:
			"corsi universitari, quiz, studio, dipartimenti, università, trivia, apprendimento",
		openGraph: {
			title: "Esplora Corsi - TriviaMore",
			description:
				"Sfoglia tutti i corsi universitari disponibili su TriviaMore. Trova quiz e materiali di studio organizzati per dipartimento e corso.",
			type: "website",
		},
	};
}

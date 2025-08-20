import { AppLayout } from "@/components/layouts/AppLayout";
import ContactPageContent from "@/components/pages/Contact";

export async function generateMetadata() {
	return {
		title: "Contatti | Trivia More",
		description:
			"Entra in contatto con il team di Trivia More. Segnala bug, proponi nuove funzionalità o contribuisci al progetto open source.",
	};
}

export default function ContactPage() {
	return (
		<AppLayout showFooter={false}>
			<ContactPageContent />
		</AppLayout>
	);
}

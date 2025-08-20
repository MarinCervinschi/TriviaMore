import { AppLayout } from "@/components/layouts/AppLayout";
import AboutPageContent from "@/components/pages/About";

export async function generateMetadata() {
	return {
		title: "Chi Siamo | Trivia More",
		description:
			"Scopri la storia e la missione di Trivia More, la piattaforma open source per la preparazione agli esami universitari di UNIMORE.",
	};
}

export default function AboutPage() {
	return (
		<AppLayout showFooter={false}>
			<AboutPageContent />
		</AppLayout>
	);
}

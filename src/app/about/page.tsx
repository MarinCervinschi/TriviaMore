import type { Metadata } from "next";

import { AppLayout } from "@/components/layouts/AppLayout";
import AboutPageContent from "@/components/pages/About";

export const metadata: Metadata = {
	title: "Chi Siamo | Trivia More",
	description:
		"Scopri la storia e la missione di Trivia More, la piattaforma open source per la preparazione agli esami universitari di UNIMORE.",
};

export default function AboutPage() {
	return (
		<AppLayout showFooter={false}>
			<AboutPageContent />
		</AppLayout>
	);
}

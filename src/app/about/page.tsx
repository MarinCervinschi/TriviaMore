import type { Metadata } from "next";

import { AppLayout } from "@/components/layouts/AppLayout";
import AboutPageContent from "@/components/pages/About";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Chi Siamo | Trivia More",
	description:
		"Scopri la storia e la missione di Trivia More, la piattaforma open source per la preparazione agli esami universitari di UNIMORE.",
};

export default async function AboutPage() {
	const session = await auth();
	return (
		<AppLayout user={session?.user} showFooter={false}>
			<AboutPageContent />
		</AppLayout>
	);
}

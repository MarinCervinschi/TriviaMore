import type { Metadata } from "next";

import { AppLayout } from "@/components/layouts/AppLayout";
import ContactPageContent from "@/components/pages/Contact";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Contatti | Trivia More",
	description:
		"Entra in contatto con il team di Trivia More. Segnala bug, proponi nuove funzionalità o contribuisci al progetto open source.",
};

export default async function ContactPage() {
	const session = await auth();
	return (
		<AppLayout user={session?.user} showFooter={false}>
			<ContactPageContent />
		</AppLayout>
	);
}

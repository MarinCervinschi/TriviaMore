import { ShieldCheckIcon } from "@solar-icons/react/linear/shield-check";
import { createFileRoute } from "@tanstack/react-router";

import { LegalDocLayout } from "@/components/legal/legal-doc-layout";
import privacyMarkdown from "@/content/legal/privacy.it.md?raw";
import { CURRENT_PRIVACY_VERSION } from "@/lib/legal/versions";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/legal/privacy")({
	head: () =>
		seoHead({
			title: "Informativa sulla Privacy",
			description:
				"Informativa sul trattamento dei dati personali degli utenti di TriviaMore ai sensi del GDPR.",
		}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<LegalDocLayout
			markdown={privacyMarkdown}
			meta={{
				slug: "privacy",
				title: "Informativa sulla Privacy",
				description:
					"Quali dati raccogliamo, perché li trattiamo, con chi li condividiamo e quali diritti ti riconosce il Regolamento UE 2016/679 (GDPR).",
				icon: ShieldCheckIcon,
				version: CURRENT_PRIVACY_VERSION,
				lastUpdated: "13 giugno 2026",
			}}
		/>
	);
}

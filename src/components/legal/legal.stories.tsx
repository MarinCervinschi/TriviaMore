import { useState } from "react";

import { ShieldIcon } from "@solar-icons/react/linear/shield";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AcceptanceCheckboxes } from "./acceptance-checkboxes";
import { LegalDocLayout } from "./legal-doc-layout";
import { LegalRelatedDocs } from "./legal-related-docs";
import { LegalToc } from "./legal-toc";

// The legal pages: a markdown document with its metadata, its table of contents, and the acceptance
// gate. The gate matters most — it is the one place a user is blocked until they act.
const meta = {
	title: "Legal/Pagine",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const MARKDOWN = `## 1. Oggetto del servizio

TriviaMore è una piattaforma di studio **open source** per gli studenti di UniMore. Il servizio è
offerto gratuitamente e senza garanzie di continuità.

## 2. Account e responsabilità

Per accedere ai contenuti privati è necessario un account. Sei responsabile della riservatezza delle
tue credenziali.

### 2.1 Contenuti proposti

I contenuti che proponi restano tuoi, e concedi alla piattaforma il diritto di pubblicarli. Le
proposte passano da una revisione prima di comparire nel catalogo.

## 3. Uso consentito

Il materiale è destinato allo studio personale. Non è consentito rivenderlo né ridistribuirlo come
prodotto proprio.

| Azione | Consentita |
|---|---|
| Studiare | sì |
| Condividere un link | sì |
| Rivendere | no |

## 4. Modifiche

Questi termini possono cambiare. Le modifiche sostanziali richiedono una nuova accettazione.
`;

export const Document: Story = {
	name: "Il documento",
	render: () => (
		<LegalDocLayout
			markdown={MARKDOWN}
			meta={{
				title: "Termini di servizio",
				description:
					"Le regole del servizio, cosa puoi fare col materiale e cosa succede ai contenuti che proponi.",
				icon: ShieldIcon,
				version: "2.1",
				lastUpdated: "12/08/2026",
				slug: "terms",
			}}
		/>
	),
};

export const Toc: Story = {
	name: "L'indice",
	parameters: { layout: "padded" },
	render: () => (
		<div className="max-w-xs">
			<LegalToc
				items={[
					{ id: "oggetto", text: "Oggetto del servizio" },
					{ id: "account", text: "Account e responsabilità" },
					{ id: "uso", text: "Uso consentito" },
					{ id: "modifiche", text: "Modifiche" },
				]}
			/>
		</div>
	),
};

export const Related: Story = {
	name: "Gli altri documenti",
	parameters: { layout: "padded" },
	render: () => (
		<div className="space-y-8">
			{(["terms", "privacy", "cookies"] as const).map(slug => (
				<LegalRelatedDocs key={slug} currentSlug={slug} />
			))}
		</div>
	),
};

function Gate({ withErrors }: { withErrors?: boolean }) {
	const [terms, setTerms] = useState(false);
	const [privacy, setPrivacy] = useState(withErrors ? false : true);
	return (
		<AcceptanceCheckboxes
			termsAccepted={terms}
			privacyAccepted={privacy}
			onTermsChange={setTerms}
			onPrivacyChange={setPrivacy}
			termsError={
				withErrors && !terms ? "Devi accettare i termini per continuare." : undefined
			}
			privacyError={
				withErrors && !privacy ? "Devi accettare l'informativa privacy." : undefined
			}
		/>
	);
}

/** Untouched and after a failed submit — the error text is the only thing that tells you why. */
export const Acceptance: Story = {
	name: "Il consenso",
	parameters: { layout: "padded" },
	render: () => (
		<div className="grid max-w-4xl gap-10 lg:grid-cols-2">
			<Gate />
			<Gate withErrors />
		</div>
	),
};

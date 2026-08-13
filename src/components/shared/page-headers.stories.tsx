import { BookIcon } from "@solar-icons/react/linear/book";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
import { LegalHero } from "@/components/legal/legal-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserHero } from "@/components/user/user-hero";

/**
 * The four page headers share one title prefix on purpose: they are the app's four openers, they
 * carry the same three things — icon, title, description — and D13 recorded a decision *not* to merge
 * them. Seeing them next to each other is how that decision gets re-checked.
 */
const meta = {
	title: "Page Headers/Confronto",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TITLE = "Analisi matematica I";
const DESCRIPTION =
	"Ingegneria Informatica · Modena. Sei sezioni, centoquarantadue domande.";

export const Browse: Story = {
	render: () => (
		<BrowsePageHeader
			icon={BookIcon}
			title={TITLE}
			description={DESCRIPTION}
			badges={
				<>
					<Badge variant="secondary" size="sm">
						6 sezioni
					</Badge>
					<Badge variant="outline" size="sm">
						3° anno
					</Badge>
				</>
			}
			stats={[
				{ label: "domande", value: 142 },
				{ label: "sezioni", value: 6 },
			]}
			actions={<Button size="sm">Inizia a studiare</Button>}
		/>
	),
};

export const User: Story = {
	render: () => (
		<UserHero
			icon={DiplomaIcon}
			title={TITLE}
			description={DESCRIPTION}
			stats={[
				{ label: "quiz completati", value: 71 },
				{ label: "media", value: "29.4" },
			]}
		/>
	),
};

export const Admin: Story = {
	render: () => (
		<div className="container pt-8">
			<AdminPageHeader
				icon={ShieldIcon}
				title={TITLE}
				description={DESCRIPTION}
				backTo="/admin"
				backLabel="Gestione"
				actions={<Button size="sm">Nuova sezione</Button>}
			/>
		</div>
	),
};

export const Legal: Story = {
	render: () => (
		<div className="container max-w-6xl pt-8">
			<LegalHero
				icon={BookIcon}
				title="Termini di servizio"
				description={DESCRIPTION}
				version="2.1"
				lastUpdated="12/08/2026"
			/>
		</div>
	),
};

/**
 * The same content through all four, which is the only way to see whether the differences are
 * decisions or drift.
 */
export const TuttiQuattro: Story = {
	name: "Tutti e quattro, stesso contenuto",
	render: () => (
		<div className="divide-border divide-y">
			{[
				[
					"BrowsePageHeader",
					<BrowsePageHeader
						key="b"
						icon={BookIcon}
						title={TITLE}
						description={DESCRIPTION}
						actions={<Button size="sm">Azione</Button>}
					/>,
				],
				[
					"UserHero",
					<UserHero key="u" icon={BookIcon} title={TITLE} description={DESCRIPTION} />,
				],
				[
					"AdminPageHeader",
					<div key="a" className="container py-8">
						<AdminPageHeader
							icon={BookIcon}
							title={TITLE}
							description={DESCRIPTION}
							actions={<Button size="sm">Azione</Button>}
						/>
					</div>,
				],
				[
					"LegalHero",
					<div key="l" className="container py-8">
						<LegalHero
							icon={BookIcon}
							title={TITLE}
							description={DESCRIPTION}
							version="2.1"
							lastUpdated="12/08/2026"
						/>
					</div>,
				],
			].map(([label, node]) => (
				<div key={label as string} className="py-4">
					<p className="text-muted-foreground eyebrow container mb-2">
						{label as string}
					</p>
					{node as React.ReactNode}
				</div>
			))}
		</div>
	),
};

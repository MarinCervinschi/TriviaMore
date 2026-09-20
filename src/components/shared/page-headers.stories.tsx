import { BookIcon } from "@solar-icons/react/linear/book";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
import { LegalHero } from "@/components/legal/legal-hero";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Four page heads, and D13's decision *not* to merge them mostly still holds — what
 * changed is why. The shell's header carries the trail now, so a page under it opens
 * with a name and its controls: that is `PageToolbar`, and `AdminPageHeader` is it
 * plus a way back up the catalogue.
 *
 * The two that stay their own are the two that are not screens under the shell:
 * **Browse** keeps its landing proportions because those pages are public and a guest
 * sees them with no shell at all, and **Legal** because those pages are documents.
 *
 * Seeing them together is how that stays a decision instead of drift.
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

/** The base: what a page under the app shell opens with. */
export const Toolbar: Story = {
	name: "PageToolbar",
	render: () => (
		<div className="container py-6">
			<PageToolbar
				title={TITLE}
				meta={DESCRIPTION}
				metrics={[
					{ label: "quiz completati", value: 71 },
					{ label: "media", value: "29.4" },
				]}
				actions={<Button size="sm">Inizia a studiare</Button>}
			/>
		</div>
	),
};

/** Its own head, at landing proportions — and its own trail, since a guest gets no shell. */
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

/** Admin adds a way back up the catalogue, which the deep entity pages need. */
export const Admin: Story = {
	render: () => (
		<div className="container pt-6">
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

/** The other that did not converge, and should not: a document, not a screen. */
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

/** The same content through all of them — the only way to see drift from decision. */
export const TuttiInsieme: Story = {
	name: "Tutti insieme, stesso contenuto",
	render: () => (
		<div className="divide-border divide-y">
			{[
				[
					"PageToolbar",
					<div key="t" className="container py-6">
						<PageToolbar
							title={TITLE}
							meta={DESCRIPTION}
							actions={<Button size="sm">Azione</Button>}
						/>
					</div>,
				],
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
					"AdminPageHeader",
					<div key="a" className="container py-6">
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

/** Where the actions outgrow the row: they wrap under the title rather than squeeze it. */
export const ToolbarControlli: Story = {
	name: "Molte azioni",
	render: () => (
		<div className="max-w-2xl">
			<div className="container py-6">
				<PageToolbar
					title={TITLE}
					actions={
						<>
							<Button variant="outline" size="sm">
								<CalendarMinimalisticIcon className="size-3.5" />
								Ultimo anno
							</Button>
							<Button variant="outline" size="sm">
								Studio + Esame
							</Button>
							<Button size="sm">Nuova sezione</Button>
						</>
					}
				/>
			</div>
		</div>
	),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { AchievementDialog } from "./achievement-dialog";
import { AchievementGroup } from "./achievement-group";
import { AchievementMedal } from "./achievement-medal";
import { AchievementStrip } from "./achievement-strip";
import { AchievementSummary } from "./achievement-summary";
import { AchievementTile } from "./achievement-tile";
import { ACHIEVEMENTS, CATALOGUE_ICONS, OVERVIEW } from "./fixtures";
import { PinPicker } from "./pin-picker";
import { PinnedAchievements } from "./pinned-achievements";

const meta = {
	title: "Achievements/Traguardi",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-3">
			<p className="text-muted-foreground eyebrow">{label}</p>
			<div className="flex flex-wrap items-end gap-6">{children}</div>
		</div>
	);
}

export const Medaglie: Story = {
	name: "La medaglia, in ogni stato",
	render: () => (
		<div className="flex flex-col gap-8">
			<Row label="Tier — un numerale, mai un metallo">
				<AchievementMedal icon="compass" accent="chart-2" shape="seal" tier={1} />
				<AchievementMedal icon="compass" accent="chart-2" shape="seal" tier={2} />
				<AchievementMedal icon="compass" accent="chart-2" shape="seal" tier={3} />
				<AchievementMedal icon="compass" accent="chart-2" shape="seal" locked />
			</Row>
			<Row label="Categoria — una sagoma e un colore, due canali per la stessa identità">
				{CATALOGUE_ICONS.filter((_, i) => [0, 3, 6, 7, 10, 12, 13].includes(i)).map(
					entry => (
						<AchievementMedal
							key={entry.label}
							icon={entry.icon}
							accent={entry.accent}
							shape={entry.shape}
							tier={2}
						/>
					)
				)}
			</Row>
			<Row label="Taglie — sm per l'hero, md per le righe, lg per la pagina">
				<AchievementMedal
					icon="hand-heart"
					accent="brand"
					shape="ribbon"
					tier={3}
					size="sm"
				/>
				<AchievementMedal
					icon="hand-heart"
					accent="brand"
					shape="ribbon"
					tier={3}
					size="md"
				/>
				<AchievementMedal
					icon="hand-heart"
					accent="brand"
					shape="ribbon"
					tier={3}
					size="lg"
				/>
			</Row>
		</div>
	),
};

export const Icone: Story = {
	name: "Le icone del catalogo v1",
	render: () => (
		<div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
			{CATALOGUE_ICONS.map(entry => (
				<div key={entry.label} className="flex flex-col items-center gap-2 text-center">
					<AchievementMedal
						icon={entry.icon}
						accent={entry.accent}
						shape={entry.shape}
					/>
					<p className="text-muted-foreground text-2xs">{entry.label}</p>
				</div>
			))}
		</div>
	),
};

/**
 * A badge inserted from the SQL console can name an icon or an accent that no map
 * knows yet. Both fall back instead of throwing — otherwise "add a badge without
 * a deploy" would be false.
 */
export const Fallback: Story = {
	name: "Il ripiego di un traguardo non mappato",
	render: () => (
		<div className="flex flex-wrap items-end gap-6">
			<AchievementMedal
				icon="una-chiave-inventata"
				accent="chart-3"
				shape="shield"
				tier={2}
			/>
			<AchievementMedal
				icon="compass"
				accent="un-token-inventato"
				shape="seal"
				tier={2}
			/>
			<AchievementMedal icon="anche-questa" accent="pure-questo" shape="pure-questa" />
		</div>
	),
};

export const Gruppi: Story = {
	name: "La griglia di una categoria, con i tre filtri",
	render: () => (
		<div className="flex flex-col gap-4">
			<AchievementGroup
				category="Esplorazione"
				achievements={ACHIEVEMENTS.filter(a => a.category === "Esplorazione")}
			/>
			<AchievementGroup
				category="Esplorazione · solo sbloccati"
				achievements={ACHIEVEMENTS.filter(a => a.category === "Esplorazione")}
				filter="sbloccati"
			/>
			<AchievementGroup
				category="Progresso · solo in corso, e non ce ne sono"
				achievements={ACHIEVEMENTS.filter(a => a.category === "Progresso")}
				filter="in-corso"
			/>
		</div>
	),
};

/**
 * Il caso che la barra non deve avere: una regola binaria ferma a zero. Una barra
 * a 0% si legge come rotta, non come un obiettivo.
 */
export const Binario: Story = {
	name: "Binario contro a soglie, affiancati",
	render: () => (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
			<AchievementTile achievement={ACHIEVEMENTS[2]!} onOpen={() => {}} />
			<AchievementTile achievement={ACHIEVEMENTS[1]!} onOpen={() => {}} />
		</div>
	),
};

export const Riepilogo: Story = {
	name: "Il riepilogo in cima alla pagina",
	render: () => (
		<AchievementSummary
			unlocked={OVERVIEW.unlocked}
			total={OVERVIEW.total}
			categories={OVERVIEW.categories}
			nextUp={OVERVIEW.nextUp}
			pinned={OVERVIEW.pinned}
		/>
	),
};

export const Striscia: Story = {
	name: "La striscia in dashboard",
	render: () => <AchievementStrip overview={OVERVIEW} />,
};

/** Con un solo traguardo sbloccato la striscia non si svuota: mostra comunque il prossimo. */
export const StrisciaMagra: Story = {
	name: "La striscia con quasi nulla da mostrare",
	render: () => (
		<AchievementStrip overview={{ ...OVERVIEW, unlocked: 1, pinned: [] }} />
	),
};

export const InEvidenza: Story = {
	name: "Le medaglie appuntate nell'hero",
	render: () => (
		<div className="flex items-center gap-2">
			<span className="border-primary/20 bg-primary/5 text-brand rounded-full border px-4 py-1.5 text-sm font-medium">
				Studente
			</span>
			<span className="bg-border h-4 w-px" aria-hidden />
			<PinnedAchievements pinned={OVERVIEW.pinned} />
		</div>
	),
};

/**
 * Il dettaglio. La catena dei livelli è il motivo per cui vale la pena aprirlo:
 * una tessera dice dove sei, la catena dice quanto manca alla fine della famiglia.
 */
export const Dettaglio: Story = {
	name: "Il popup di dettaglio",
	render: () => <DetailExample />,
};

function DetailExample() {
	const explorer = ACHIEVEMENTS.filter(a => a.family === "explorer");
	return (
		<AchievementDialog
			achievement={explorer[1] ?? ACHIEVEMENTS[0]!}
			family={explorer}
			onOpenChange={() => {}}
		/>
	);
}

/**
 * Il selettore dei pin. La mutation lancia se si salva — le api sono stubbate in
 * Storybook — e va bene così: la story è onesta su cosa non ha.
 */
export const Pin: Story = {
	name: "Scegliere i traguardi in evidenza",
	render: () => (
		<PinPicker
			open
			onOpenChange={() => {}}
			unlocked={ACHIEVEMENTS.filter(a => a.awardedAt !== null)}
			pinned={OVERVIEW.pinned.slice(0, 2)}
		/>
	),
};

import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { BrowseBreadcrumb } from "./browse-breadcrumb";
import { BrowseContributeState, BrowseEmptyState } from "./browse-empty-state";
import { ClassSyllabus } from "./class-syllabus";
import { ExpandableDescription } from "./expandable-description";
import { PlanActivities } from "./plan-activities";
import { SearchFilter } from "./search-filter";
import { FULL_SYLLABUS, PARTIAL_SYLLABUS } from "./syllabus-fixtures";

const meta = {
	title: "Browse/Blocchi",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Breadcrumb: Story = {
	name: "Breadcrumb",
	render: () => (
		<div className="space-y-6">
			<BrowseBreadcrumb
				segments={[{ label: "Esplora", href: "/browse" }]}
				current="DIEF"
			/>
			<BrowseBreadcrumb
				segments={[
					{ label: "Esplora", href: "/browse" },
					{ label: "DIEF", href: "/browse/dief" },
					{ label: "Ingegneria Informatica", href: "/browse/dief/inf" },
				]}
				current="Analisi matematica I"
			/>
			<p className="text-muted-foreground text-xs">
				Il secondo è la profondità massima della gerarchia: dipartimento, corso,
				insegnamento, sezione.
			</p>
		</div>
	),
};

export const Empty: Story = {
	name: "Niente da mostrare",
	render: () => (
		<div className="space-y-8">
			<BrowseEmptyState />
			<BrowseEmptyState message="Nessun insegnamento con questi filtri." />
			<BrowseContributeState message="Questa sezione non ha ancora domande.">
				<Button size="sm">Proponi contenuti</Button>
			</BrowseContributeState>
		</div>
	),
};

function DescriptionHarness() {
	return (
		<div className="max-w-2xl space-y-8">
			<ExpandableDescription text="Una descrizione breve, che sta in tre righe e non ha nulla da espandere." />
			<ExpandableDescription
				text={
					"Il corso introduce il calcolo differenziale e integrale per funzioni di una variabile reale, con particolare attenzione ai teoremi fondamentali e alle loro dimostrazioni. " +
					"Si affrontano successioni e serie numeriche, la continuità e la derivabilità, lo studio di funzione e l'integrazione secondo Riemann. " +
					"La seconda parte è dedicata alle equazioni differenziali ordinarie del primo e del secondo ordine, con applicazioni alla modellazione di fenomeni fisici. " +
					"Il corso richiede una buona familiarità con l'algebra e la trigonometria di base."
				}
			/>
			<p className="text-muted-foreground text-xs">
				Il secondo supera le tre righe, quindi compare il controllo per espanderlo.
			</p>
		</div>
	);
}

export const Description: Story = {
	name: "Descrizione espandibile",
	render: () => <DescriptionHarness />,
};

function FilterHarness() {
	const [value, setValue] = useState("");
	return (
		<div className="max-w-md space-y-3">
			<SearchFilter
				value={value}
				onChange={setValue}
				placeholder="Cerca insegnamento, dipartimento..."
			/>
			<p className="text-muted-foreground text-xs tabular-nums">
				valore: {value || "(vuoto)"}
			</p>
		</div>
	);
}

export const Search: Story = {
	name: "Filtro di ricerca",
	render: () => <FilterHarness />,
};

export const Activities: Story = {
	name: "Altre attività del piano",
	render: () => (
		<PlanActivities
			activities={[
				{
					id: "a1",
					name: "Obblighi Formativi Aggiuntivi",
					cfu: 0,
					classYear: 1,
					group: null,
					curricula: [],
				},
				{
					id: "a2",
					name: "Tirocinio",
					cfu: 12,
					classYear: 3,
					group: null,
					curricula: [],
				},
				{
					id: "a3",
					name: "Prova Finale",
					cfu: 6,
					classYear: 3,
					group: null,
					curricula: [],
				},
				{
					id: "a4",
					name: "Tirocinio/Attività Progettuale",
					cfu: null,
					classYear: 3,
					group: null,
					curricula: [],
				},
			]}
		/>
	),
};

const B2_3 = {
	code: "F",
	label: "Livello inglese B2 3cfu + tirocinio 9cfu",
	position: 2,
};
const B2_0 = {
	code: "F",
	label: "Livello inglese B2 0cfu + tirocinio 12cfu",
	position: 3,
};

/** Two choice groups offer the same activities with different credits, so each row names its group. */
export const ActivitiesWithGroups: Story = {
	name: "Altre attività del piano, con i gruppi a scelta",
	render: () => (
		<PlanActivities
			activities={[
				{
					id: "b1",
					name: "Livello di Competenza Linguistica in Lingua Inglese B2",
					cfu: 3,
					classYear: 1,
					group: B2_3,
					curricula: ["C1"],
				},
				{
					id: "b2",
					name: "Tirocinio/Attività Progettuale",
					cfu: 9,
					classYear: 1,
					group: B2_3,
					curricula: ["C1"],
				},
				{
					id: "b3",
					name: "Livello di Competenza Linguistica in Lingua Inglese B2",
					cfu: 0,
					classYear: 1,
					group: B2_0,
					curricula: ["C1"],
				},
				{
					id: "b4",
					name: "Tirocinio/Attività Progettuale",
					cfu: 12,
					classYear: 1,
					group: B2_0,
					curricula: ["C1"],
				},
				{
					id: "b5",
					name: "Prova Finale",
					cfu: 18,
					classYear: 2,
					group: { code: "OO", label: "Obbligatori", position: 0 },
					curricula: ["C1", "C2"],
				},
			]}
		/>
	),
};

export const Syllabus: Story = {
	name: "Programma ufficiale",
	render: () => (
		<div className="max-w-5xl">
			<ClassSyllabus syllabus={FULL_SYLLABUS} />
		</div>
	),
};

/** A syllabus with only some fields published lists only those. */
export const SyllabusPartial: Story = {
	name: "Programma ufficiale, incompleto",
	render: () => (
		<div className="max-w-5xl">
			<ClassSyllabus syllabus={PARTIAL_SYLLABUS} />
		</div>
	),
};

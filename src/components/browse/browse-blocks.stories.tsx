import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { BrowseBreadcrumb } from "./browse-breadcrumb";
import { BrowseContributeState, BrowseEmptyState } from "./browse-empty-state";
import { ExpandableDescription } from "./expandable-description";
import { SearchFilter } from "./search-filter";

// The small parts a browse page is framed with: where you are, what to do when there is nothing, and
// how a long description behaves.
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

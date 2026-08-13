import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComingSoon } from "@/components/coming-soon";
import { LoadingPage } from "@/components/loading/loading-page";
import { FilterPills } from "@/components/search/filter-pills";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";

import { ContentHierarchyDiagram } from "./content-hierarchy-diagram";

/**
 * The pieces that belong to no feature: the hierarchy explainer, the filter pills, the user
 * breadcrumb, and the two full-page states.
 */
const meta = {
	title: "Shared/Blocchi",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The five levels of the catalog, the diagram the landing page and the request form both show. */
export const Hierarchy: Story = {
	name: "La gerarchia",
	render: () => (
		<div className="space-y-12">
			<ContentHierarchyDiagram />
			<ContentHierarchyDiagram orientation="horizontal" />
			<ContentHierarchyDiagram showFinalLabel={false} />
		</div>
	),
};

function Pills({ label }: { label?: string }) {
	const [value, setValue] = useState("");
	return (
		<FilterPills
			label={label}
			value={value}
			onChange={setValue}
			options={[
				{ value: "departments", label: "Dipartimenti" },
				{ value: "courses", label: "Corsi" },
				{ value: "classes", label: "Insegnamenti" },
				{ value: "sections", label: "Sezioni" },
				{ value: "questions", label: "Domande" },
			]}
		/>
	);
}

/** Nothing selected means «Tutti» is active: the empty string is the state, not a missing one. */
export const Pill: Story = {
	name: "Le pill dei filtri",
	render: () => (
		<div className="space-y-6">
			<Pills />
			<Pills label="Tipo" />
		</div>
	),
};

export const Breadcrumb: Story = {
	name: "Il breadcrumb utente",
	render: () => (
		<div className="flex flex-col items-start gap-4">
			<UserBreadcrumb current="Progressi" />
			<UserBreadcrumb current="Analisi matematica I" />
		</div>
	),
};

export const Loading: Story = {
	name: "La pagina in caricamento",
	parameters: { layout: "fullscreen" },
	render: () => <LoadingPage />,
};

export const Soon: Story = {
	name: "Coming soon",
	parameters: { layout: "fullscreen" },
	render: () => <ComingSoon />,
};

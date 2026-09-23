import { useState } from "react";

import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { HomeIcon } from "@solar-icons/react/linear/home";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComingSoon } from "@/components/coming-soon";
import { LoadingPage } from "@/components/loading/loading-page";
import { FilterPills } from "@/components/search/filter-pills";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { SeeAllLink } from "@/components/shared/see-all-link";

import { ContentHierarchyDiagram } from "./content-hierarchy-diagram";
import { DeltaBadge } from "./delta-badge";

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

/**
 * The trails the shell's header draws. They are derived from the matched routes by
 * `useRouteCrumbs`, not written by a page, so this shows the shapes it produces.
 */
export const Breadcrumb: Story = {
	name: "Il breadcrumb utente",
	render: () => (
		<div className="flex flex-col items-start gap-4">
			<AppBreadcrumb
				surface="plain"
				icons="first"
				items={[
					{ label: "Dashboard", to: "/user", icon: HomeIcon },
					{ label: "Analytics" },
				]}
			/>
			<AppBreadcrumb
				surface="plain"
				icons="first"
				items={[
					{ label: "Dashboard", to: "/user", icon: HomeIcon },
					{ label: "Analytics", to: "/user/analytics" },
					{ label: "Analisi matematica I" },
				]}
			/>
			<AppBreadcrumb
				surface="plain"
				icons="first"
				items={[
					{ label: "Dashboard", to: "/user", icon: HomeIcon },
					{ label: "Analytics", to: "/user/analytics" },
					{ label: "Storico" },
				]}
			/>
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

/**
 * The "and the rest is over here" link, at the one size every block uses. The four
 * call sites had drifted into four recipes; this is what they all render now.
 */
export const SeeAll: Story = {
	name: "Il link «vedi tutto»",
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<SeeAllLink to="/user/analytics" icon={GraphUpIcon}>
				Analisi complete
			</SeeAllLink>
			<SeeAllLink to="/user/achievements" icon={CupFirstIcon}>
				Tutti i traguardi
			</SeeAllLink>
			<SeeAllLink to="/user/classes" icon={DiplomaIcon}>
				Tutti gli insegnamenti
			</SeeAllLink>
		</div>
	),
};

/** The change pill every metric shares. `null` renders nothing — see the last cell. */
export const Delta: Story = {
	name: "Il delta",
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<DeltaBadge value={14} />
			<DeltaBadge value={-6} />
			<DeltaBadge value={0} />
			<DeltaBadge value={3} unit="points" />
			<DeltaBadge value={1.2} unit="raw" />
			<span className="text-muted-foreground text-xs">
				null → <DeltaBadge value={null} />
				(niente)
			</span>
		</div>
	),
};

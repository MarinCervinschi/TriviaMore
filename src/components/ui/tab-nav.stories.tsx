import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { TabNav } from "./tab-nav";

/**
 * Underlined tabs for the row under a page's title. The other tab set, `Tabs`, is
 * the enclosed pill group — this one marks the selected item alone and carries no
 * rule along the row, so it survives the page band's dots behind it.
 */
const meta = {
	title: "UI/TabNav",
	component: TabNav,
	parameters: { layout: "padded" },
} satisfies Meta<typeof TabNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Route tabs: each is a page of its own, and the current route selects one. */
export const Rotte: Story = {
	name: "Tab di navigazione",
	parameters: { path: "/user/analytics/courses" },
	args: {
		label: "Sezioni",
		tabs: [
			{ key: "overview", label: "Panoramica", to: "/user/analytics" },
			{ key: "courses", label: "Per corso", to: "/user/analytics/courses" },
			{ key: "history", label: "Storico", to: "/user/analytics/history" },
			{ key: "achievements", label: "Traguardi", to: "/user/achievements" },
		],
	},
};

/** Slices of one page, with the count of what each holds. */
export const Filtri: Story = {
	name: "Tab di filtro, con conteggi",
	args: { label: "Categorie", tabs: [] },
	render: () => <Filtered />,
};

function Filtered() {
	const [active, setActive] = useState("studio");
	const groups = [
		{ key: "studio", label: "Studio", badge: "4/9" },
		{ key: "costanza", label: "Costanza", badge: "2/5" },
		{ key: "esplorazione", label: "Esplorazione", badge: "7/7" },
	];

	return (
		<TabNav
			label="Categorie"
			tabs={groups.map(group => ({
				...group,
				active: group.key === active,
				onSelect: () => setActive(group.key),
			}))}
		/>
	);
}

/** More tabs than the row can hold: it scrolls sideways, without a visible bar. */
export const Overflow: Story = {
	name: "Riga che trabocca",
	args: { label: "Sezioni", tabs: [] },
	render: () => (
		<div className="max-w-sm">
			<Filtered />
		</div>
	),
};

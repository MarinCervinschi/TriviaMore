import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	type GraphFiltersState,
	createEmptyFiltersState,
} from "@/lib/browse/graph-filters";
import type { GraphData } from "@/lib/browse/types";

import { GraphFilters } from "./graph-filters";
import { NetworkGraph } from "./network-graph";

/**
 * The department/course network. `NetworkGraph` draws on WebGL through reagraph, so this is the one
 * place a story can only be judged in the browser — a green build proves the graph compiles, not that
 * it paints.
 */
const meta = {
	title: "Graph/Rete",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA: GraphData = {
	departments: [
		{ id: "d1", code: "DIEF", name: "Ingegneria «Enzo Ferrari»", area: "TECNOLOGIA" },
		{
			id: "d2",
			code: "FIM",
			name: "Scienze Fisiche, Informatiche e Matematiche",
			area: "SCIENZE",
		},
		{
			id: "d3",
			code: "CHIMOMO",
			name: "Scienze Mediche e Chirurgiche",
			area: "SALUTE",
		},
		{ id: "d4", code: "DSV", name: "Scienze della Vita", area: "VITA" },
		{
			id: "d5",
			code: "DCE",
			name: "Comunicazione ed Economia",
			area: "SOCIETA_CULTURA",
		},
	],
	courses: [
		{
			id: "c1",
			code: "L-8",
			name: "Ingegneria Informatica",
			departmentId: "d1",
			courseType: "BACHELOR",
			location: "MODENA",
		},
		{
			id: "c2",
			code: "LM-32",
			name: "Computer Engineering",
			departmentId: "d1",
			courseType: "MASTER",
			location: "MODENA",
		},
		{
			id: "c3",
			code: "L-9",
			name: "Ingegneria Meccanica",
			departmentId: "d1",
			courseType: "BACHELOR",
			location: "MODENA",
		},
		{
			id: "c4",
			code: "L-31",
			name: "Informatica",
			departmentId: "d2",
			courseType: "BACHELOR",
			location: "MODENA",
		},
		{
			id: "c5",
			code: "LM-18",
			name: "Data Science",
			departmentId: "d2",
			courseType: "MASTER",
			location: "MODENA",
		},
		{
			id: "c6",
			code: "LM-41",
			name: "Medicina e Chirurgia",
			departmentId: "d3",
			courseType: "SINGLE_CYCLE",
			location: "MODENA",
		},
		{
			id: "c7",
			code: "L-13",
			name: "Scienze Biologiche",
			departmentId: "d4",
			courseType: "BACHELOR",
			location: "REGGIO_EMILIA",
		},
		{
			id: "c8",
			code: "L-20",
			name: "Scienze della Comunicazione",
			departmentId: "d5",
			courseType: "BACHELOR",
			location: "REGGIO_EMILIA",
		},
		{
			id: "c9",
			code: "LM-56",
			name: "Economia e Politiche Pubbliche",
			departmentId: "d5",
			courseType: "MASTER",
			location: "MANTOVA",
		},
	],
};

const TOTALS = { departments: DATA.departments.length, courses: DATA.courses.length };

function Filters({ initial }: { initial?: Partial<GraphFiltersState> }) {
	const [filters, setFilters] = useState<GraphFiltersState>({
		...createEmptyFiltersState(),
		...initial,
	});
	const active =
		filters.areas.size > 0 || filters.campuses.size > 0 || filters.courseTypes.size > 0;

	return (
		<GraphFilters
			filters={filters}
			onChange={setFilters}
			visibleCounts={active ? { departments: 2, courses: 4 } : TOTALS}
			totalCounts={TOTALS}
		/>
	);
}

export const Filtri: Story = {
	name: "I filtri",
	parameters: { layout: "padded" },
	render: () => <Filters />,
};

/** With three groups active, which is where the counts and the reset appear. */
export const FiltriAttivi: Story = {
	name: "I filtri attivi",
	parameters: { layout: "padded" },
	render: () => (
		<Filters
			initial={{
				areas: new Set(["TECNOLOGIA", "SCIENZE"]),
				campuses: new Set(["MODENA"]),
				courseTypes: new Set(["MASTER"]),
			}}
		/>
	),
};

export const Rete: Story = {
	name: "Il grafo",
	render: () => (
		<div className="h-[640px] w-full">
			<NetworkGraph data={DATA} />
		</div>
	),
};

export const ReteFiltrata: Story = {
	name: "Il grafo filtrato",
	render: () => (
		<div className="h-[640px] w-full">
			<NetworkGraph
				data={DATA}
				filters={{ ...createEmptyFiltersState(), areas: new Set(["TECNOLOGIA"]) }}
			/>
		</div>
	),
};

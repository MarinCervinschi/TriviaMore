import { useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { EyeIcon } from "@solar-icons/react/linear/eye";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";

import { DataTable } from "./data-table";
import {
	DataTableInlineFilterAdd,
	DataTableInlineFilterChips,
} from "./data-table-inline-filters";
import { DataTableToolbar } from "./data-table-toolbar";
import { DIFFICULTY_LABELS, SECTIONS, column } from "./fixtures";
import { useDataTable } from "./use-data-table";
import type { DataTableSearch } from "./use-data-table";

type StorySearch = DataTableSearch & {
	course?: string;
	difficulty?: string;
	visibility?: string;
};

/**
 * The inline filter surface, faithful to the ReUI original: a filter-icon button
 * top-right that opens a two-page menu (search a field → tick its values), and a
 * removable segmented chip per active facet on the left — `campo │ operatore ▾ │
 * valori ▾ │ ×`. The operator «è uno di / non è uno di» actually filters (see
 * `facet-filter`). Enabled with `filterVariant="inline"` on the toolbar; the
 * column's `meta.facet` stays the single source of truth.
 */
const meta = {
	title: "Data Table/Filtri inline",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const COURSE_OPTIONS = [
	{ value: "Analisi Matematica I", label: "Analisi Matematica I", icon: GraphUpIcon },
	{ value: "Algoritmi", label: "Algoritmi", icon: DiplomaIcon },
	{ value: "Basi di Dati", label: "Basi di Dati", icon: DocumentTextIcon },
];

const columns = [
	column.accessor("name", {
		header: "Sezione",
		meta: { label: "Sezione" },
		cell: ({ row }) => (
			<div>
				<span className="font-medium">{row.original.name}</span>
				<p className="text-muted-foreground text-xs">{row.original.course}</p>
			</div>
		),
	}),
	column.accessor("course", {
		header: "Insegnamento",
		enableSorting: false,
		filterFn: "facet",
		meta: {
			label: "Insegnamento",
			hideBelow: "md",
			facet: { options: COURSE_OPTIONS, icon: BookIcon },
		},
		cell: ({ row }) => (
			<span className="text-muted-foreground text-sm">{row.original.course}</span>
		),
	}),
	column.accessor("difficulty", {
		header: "Difficoltà",
		filterFn: "facet",
		meta: {
			label: "Difficoltà",
			align: "center",
			facet: {
				icon: GraphUpIcon,
				options: [
					{ value: "EASY", label: "Facile" },
					{ value: "MEDIUM", label: "Media" },
					{ value: "HARD", label: "Difficile" },
				],
			},
		},
		cell: ({ row }) => (
			<Badge variant="outline" className="rounded-full">
				{DIFFICULTY_LABELS[row.original.difficulty]}
			</Badge>
		),
	}),
	column.accessor("visibility", {
		header: "Visibilità",
		filterFn: "facet",
		meta: {
			label: "Visibilità",
			align: "center",
			facet: {
				icon: EyeIcon,
				options: [
					{ value: "public", label: "Pubblica" },
					{ value: "private", label: "Privata" },
				],
			},
		},
		cell: ({ row }) => (
			<Badge
				variant={row.original.visibility === "public" ? "default" : "secondary"}
				className="rounded-full"
			>
				{row.original.visibility === "public" ? "Pubblica" : "Privata"}
			</Badge>
		),
	}),
	column.accessor("questions", {
		header: "Domande",
		meta: { label: "Domande", align: "center" },
	}),
];

function useSectionsTable(initial: StorySearch) {
	const [search, setSearch] = useState<StorySearch>(initial);
	return useDataTable({
		data: SECTIONS,
		columns,
		pageSize: 5,
		searchFn: (row, query) =>
			row.name.toLowerCase().includes(query) ||
			row.course.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => setSearch(prev => ({ ...prev, ...patch })),
		},
	});
}

function InlineTable({
	initial = {},
	variant = "inline",
}: {
	initial?: StorySearch;
	variant?: "inline" | "buttons";
}) {
	const table = useSectionsTable(initial);
	return (
		<DataTable
			table={table}
			density="compact"
			toolbar={
				<DataTableToolbar
					table={table}
					filterVariant={variant}
					searchPlaceholder="Cerca sezioni..."
				/>
			}
		/>
	);
}

/** Just the chips + add control, to show the two sizes in isolation. */
function InlineBar({
	initial = {},
	size = "default",
}: {
	initial?: StorySearch;
	size?: "sm" | "default";
}) {
	const table = useSectionsTable(initial);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<DataTableInlineFilterChips table={table} size={size} />
			<DataTableInlineFilterAdd table={table} size={size} />
		</div>
	);
}

/** Nothing added: search on the left, the filter icon top-right, the columns button. */
export const Vuoto: Story = {
	name: "Vuoto",
	render: () => <InlineTable />,
};

/**
 * Two active facets as chips on the left — one includes, one excludes («non è uno
 * di», seeded from `?course=!Algoritmi`); the filter icon stays top-right.
 */
export const ConFiltri: Story = {
	name: "Con filtri attivi",
	render: () => <InlineTable initial={{ difficulty: "HARD", course: "!Algoritmi" }} />,
};

/** The two toolbar variants: always-on dashed buttons vs. the icon + chips. */
export const Confronto: Story = {
	name: "Confronto varianti",
	render: () => (
		<div className="space-y-10">
			<div className="space-y-2">
				<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					buttons — un bottone per facet, sempre visibile
				</p>
				<InlineTable variant="buttons" initial={{ difficulty: "HARD" }} />
			</div>
			<div className="space-y-2">
				<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					inline — icona filtro + chip rimovibili
				</p>
				<InlineTable variant="inline" initial={{ difficulty: "HARD" }} />
			</div>
		</div>
	),
};

/** The chip and control at both sizes; the app uses `sm`. */
export const Taglie: Story = {
	name: "Taglie",
	render: () => (
		<div className="space-y-8">
			<div className="space-y-2">
				<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					default
				</p>
				<InlineBar
					size="default"
					initial={{ difficulty: "HARD", course: "!Algoritmi" }}
				/>
			</div>
			<div className="space-y-2">
				<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					sm
				</p>
				<InlineBar size="sm" initial={{ difficulty: "HARD", visibility: "public" }} />
			</div>
		</div>
	),
};

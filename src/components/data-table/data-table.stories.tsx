import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tanstack/react-router";
import { BookOpen, Inbox, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { DataTable } from "./data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { createDataTableColumns } from "./features";
import { useDataTable } from "./use-data-table";

type Section = {
	id: string;
	name: string;
	course: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	questions: number;
	visibility: "public" | "private";
};

const SECTIONS: Section[] = [
	{
		id: "1",
		name: "Limiti e continuità",
		course: "Analisi Matematica I",
		difficulty: "MEDIUM",
		questions: 42,
		visibility: "public",
	},
	{
		id: "2",
		name: "Derivate",
		course: "Analisi Matematica I",
		difficulty: "EASY",
		questions: 30,
		visibility: "public",
	},
	{
		id: "3",
		name: "Integrali definiti",
		course: "Analisi Matematica I",
		difficulty: "HARD",
		questions: 18,
		visibility: "private",
	},
	{
		id: "4",
		name: "Grafi e visite",
		course: "Algoritmi",
		difficulty: "HARD",
		questions: 55,
		visibility: "public",
	},
	{
		id: "5",
		name: "Complessità computazionale",
		course: "Algoritmi",
		difficulty: "MEDIUM",
		questions: 24,
		visibility: "public",
	},
	{
		id: "6",
		name: "Normalizzazione",
		course: "Basi di Dati",
		difficulty: "EASY",
		questions: 12,
		visibility: "private",
	},
	{
		id: "7",
		name: "Transazioni e ACID",
		course: "Basi di Dati",
		difficulty: "MEDIUM",
		questions: 27,
		visibility: "public",
	},
];

const DIFFICULTY_LABELS: Record<Section["difficulty"], string> = {
	EASY: "Facile",
	MEDIUM: "Media",
	HARD: "Difficile",
};

const column = createDataTableColumns<Section>();

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
	column.accessor("difficulty", {
		header: "Difficoltà",
		meta: {
			label: "Difficoltà",
			align: "center",
			facet: {
				options: [
					{ value: "EASY", label: "Facile" },
					{ value: "MEDIUM", label: "Media" },
					{ value: "HARD", label: "Difficile" },
				],
			},
		},
		filterFn: "arrIncludesSome",
		cell: ({ row }) => (
			<Badge variant="outline" className="rounded-full">
				{DIFFICULTY_LABELS[row.original.difficulty]}
			</Badge>
		),
	}),
	column.accessor("visibility", {
		header: "Visibilità",
		meta: {
			label: "Visibilità",
			align: "center",
			hideBelow: "md",
			facet: {
				options: [
					{ value: "public", label: "Pubblica" },
					{ value: "private", label: "Privata" },
				],
			},
		},
		filterFn: "arrIncludesSome",
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

const meta = {
	title: "Data Table/DataTable",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function AdminExample() {
	const table = useDataTable({
		data: SECTIONS,
		columns: [
			...columns,
			column.display({
				id: "actions",
				header: "Azioni",
				enableSorting: false,
				enableHiding: false,
				meta: { label: "Azioni", align: "right" },
				cell: () => (
					<div className="flex items-center justify-end gap-1">
						<Button variant="ghost" size="icon" className="rounded-lg">
							<Pencil className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" className="rounded-lg">
							<Trash2 className="text-destructive h-4 w-4" />
						</Button>
					</div>
				),
			}),
		],
		pageSize: 5,
		searchFn: (row, query) =>
			row.name.toLowerCase().includes(query) ||
			row.course.toLowerCase().includes(query),
	});

	return (
		<DataTable
			table={table}
			density="compact"
			toolbar={<DataTableToolbar table={table} searchPlaceholder="Cerca sezioni..." />}
			empty={
				<EmptyState
					icon={Inbox}
					title="Nessuna sezione trovata"
					description="Prova a modificare la ricerca o i filtri."
				/>
			}
		/>
	);
}

function BrowseExample() {
	const table = useDataTable({
		data: SECTIONS,
		columns,
		pageSize: 5,
		searchFn: (row, query) => row.name.toLowerCase().includes(query),
	});

	return (
		<DataTable
			table={table}
			rowLink={row => <Link to="/browse" aria-label={`Apri ${row.name}`} />}
			toolbar={<DataTableToolbar table={table} searchPlaceholder="Cerca sezioni..." />}
		/>
	);
}

function EmptyExample() {
	const table = useDataTable({ data: [] as Section[], columns });

	return (
		<DataTable
			table={table}
			toolbar={<DataTableToolbar table={table} searchable={false} />}
			empty={
				<EmptyState
					icon={BookOpen}
					title="Nessuna sezione"
					description="Questo insegnamento non ha ancora sezioni."
				/>
			}
		/>
	);
}

/** Dense rows, an actions column and no row navigation — the admin layout. */
export const Admin: Story = { render: () => <AdminExample /> };

/** Roomy rows with a trailing arrow column that makes each row navigable. */
export const Browse: Story = { render: () => <BrowseExample /> };

export const Empty: Story = { render: () => <EmptyExample /> };

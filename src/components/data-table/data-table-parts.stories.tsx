import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableViewOptions } from "./data-table-view-options";
import { SECTIONS, columns } from "./fixtures";
import { useDataTable } from "./use-data-table";

const meta = {
	title: "Data Table/Toolbar",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function useTable(rows = SECTIONS) {
	return useDataTable({
		data: rows,
		columns,
		pageSize: 3,
		searchFn: (row, query) =>
			row.name.toLowerCase().includes(query) ||
			row.course.toLowerCase().includes(query),
	});
}

function Toolbar({ withActions }: { withActions?: boolean }) {
	const table = useTable();
	const rows = table.getRowModel().rows.length;
	return (
		<div className="space-y-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Cerca sezioni..."
				actions={withActions ? <Button size="sm">Nuova sezione</Button> : undefined}
			/>
			<p className="text-muted-foreground text-sm tabular-nums">
				{rows} righe visibili su {SECTIONS.length}. Clicca un filtro e guarda questo
				numero: se non cambia, il filtro non funziona.
			</p>
		</div>
	);
}

export const Toolbar_: Story = { name: "La toolbar", render: () => <Toolbar /> };

export const WithAction: Story = {
	name: "Con un'azione",
	render: () => <Toolbar withActions />,
};

function Filters() {
	const table = useTable();
	const difficulty = table.getColumn("difficulty");
	const visibility = table.getColumn("visibility");
	return (
		<div className="flex flex-wrap items-center gap-3">
			{difficulty && (
				<DataTableFacetedFilter
					column={difficulty}
					title="Difficoltà"
					options={[
						{ value: "EASY", label: "Facile" },
						{ value: "MEDIUM", label: "Media" },
						{ value: "HARD", label: "Difficile" },
					]}
				/>
			)}
			{visibility && (
				<DataTableFacetedFilter
					column={visibility}
					title="Visibilità"
					options={[
						{ value: "public", label: "Pubblica" },
						{ value: "private", label: "Privata" },
					]}
				/>
			)}
		</div>
	);
}

export const Facets: Story = { name: "I filtri a faccette", render: () => <Filters /> };

function Headers() {
	const table = useTable();
	const headers = table.getHeaderGroups()[0]?.headers ?? [];
	return (
		<div className="flex flex-wrap items-center gap-8">
			{headers.map(header => (
				<DataTableColumnHeader
					key={header.id}
					header={header}
					align={header.column.columnDef.meta?.align}
				/>
			))}
		</div>
	);
}

/** A header cycles asc and desc, with no unsorted step. */
export const Headers_: Story = {
	name: "Intestazioni ordinabili",
	render: () => <Headers />,
};

function Columns() {
	const table = useTable();
	return <DataTableViewOptions table={table} />;
}

export const ViewOptions: Story = { name: "Colonne", render: () => <Columns /> };

function Pager({ rows }: { rows: number }) {
	const table = useTable(SECTIONS.slice(0, rows));
	return <DataTablePagination table={table} />;
}

export const Pagination: Story = {
	name: "Impaginazione",
	render: () => (
		<div className="space-y-10">
			<Pager rows={SECTIONS.length} />
			<Pager rows={2} />
		</div>
	),
};

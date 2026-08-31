import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";

import { DataTable } from "./data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { SECTIONS, type Section, column, columns } from "./fixtures";
import { useDataTable } from "./use-data-table";

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
				enableHiding: false,
				meta: { label: "Azioni", align: "right" },
				cell: () => (
					<div className="flex items-center justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="rounded-lg"
							aria-label="Modifica"
						>
							<Pen2Icon className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-lg"
							aria-label="Elimina"
						>
							<TrashBinMinimalisticIcon className="text-danger h-4 w-4" />
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
				<InlineEmpty>Nessuna sezione trovata: prova a cambiare i filtri.</InlineEmpty>
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
			empty={<InlineEmpty>Questo insegnamento non ha ancora sezioni.</InlineEmpty>}
		/>
	);
}

/** Dense rows, an actions column and no row navigation — the admin layout. */
export const Admin: Story = { render: () => <AdminExample /> };

/** Roomy rows with a trailing arrow column that makes each row navigable. */
export const Browse: Story = { render: () => <BrowseExample /> };

export const Empty: Story = { render: () => <EmptyExample /> };

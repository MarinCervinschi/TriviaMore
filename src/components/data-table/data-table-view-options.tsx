import { Tuning2Icon } from "@solar-icons/react/linear/tuning-2";
import type { RowData } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { DataTableInstance } from "./features";

export function DataTableViewOptions<TData extends RowData>({
	table,
}: {
	table: DataTableInstance<TData>;
}) {
	const columns = table.getAllColumns().filter(column => column.getCanHide());

	if (columns.length === 0) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-9">
					<Tuning2Icon className="h-4 w-4" />
					<span className="hidden sm:inline">Colonne</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuLabel>Mostra colonne</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{columns.map(column => (
					<DropdownMenuCheckboxItem
						key={column.id}
						checked={column.getIsVisible()}
						onCheckedChange={value => column.toggleVisibility(Boolean(value))}
					>
						{column.columnDef.meta?.label ?? column.id}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

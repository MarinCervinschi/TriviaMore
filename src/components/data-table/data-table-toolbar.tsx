import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import type { RowData } from "@tanstack/react-table";

import { CloseGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import type { DataTableInstance } from "./features";

export function DataTableToolbar<TData extends RowData>({
	table,
	searchPlaceholder = "Cerca...",
	searchable = true,
	showViewOptions = true,
	filters,
	actions,
	className,
}: {
	table: DataTableInstance<TData>;
	searchPlaceholder?: string;
	searchable?: boolean;
	showViewOptions?: boolean;
	/** Extra filter controls, for state the table itself does not own. */
	filters?: ReactNode;
	/** Page-level buttons rendered at the end of the toolbar. */
	actions?: ReactNode;
	className?: string;
}) {
	const globalFilter = String(table.state.globalFilter ?? "");
	const filterColumns = table
		.getAllColumns()
		.filter(column => column.columnDef.meta?.facet);
	const isFiltered = globalFilter !== "" || table.state.columnFilters.length > 0;

	// Local state keeps typing snappy: the table (and the URL) only update once
	// the debounce settles, instead of on every keystroke.
	const [query, setQuery] = useState(globalFilter);
	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		if (debouncedQuery !== globalFilter) table.setGlobalFilter(debouncedQuery);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedQuery]);

	useEffect(() => {
		setQuery(globalFilter);
	}, [globalFilter]);

	return (
		<div
			className={cn(
				"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				className
			)}
		>
			<div className="flex flex-1 flex-wrap items-center gap-2">
				{searchable && (
					<div className="relative w-full sm:w-64">
						<MagnifierIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							value={query}
							onChange={event => setQuery(event.target.value)}
							placeholder={searchPlaceholder}
							className="h-9 rounded-xl pl-9"
						/>
					</div>
				)}

				{filters}

				{filterColumns.map(column => (
					<DataTableFacetedFilter
						key={column.id}
						column={column}
						title={column.columnDef.meta?.label ?? column.id}
						options={column.columnDef.meta?.facet?.options ?? []}
					/>
				))}

				{isFiltered && (
					<Button
						variant="ghost"
						size="sm"
						className="h-9 rounded-xl px-2"
						onClick={() => table.options.meta?.resetFilters()}
					>
						Pulisci
						<CloseGlyph className="h-4 w-4" />
					</Button>
				)}
			</div>

			<div className="flex items-center gap-2">
				{showViewOptions && <DataTableViewOptions table={table} />}
				{actions}
			</div>
		</div>
	);
}

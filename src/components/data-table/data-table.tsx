import { cloneElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { FlexRender } from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import type {
	DataTableAlign,
	DataTableBreakpoint,
	DataTableInstance,
} from "./features";

const ALIGN_CLASS: Record<DataTableAlign, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

const HIDE_BELOW_CLASS: Record<DataTableBreakpoint, string> = {
	sm: "hidden sm:table-cell",
	md: "hidden md:table-cell",
	lg: "hidden lg:table-cell",
	xl: "hidden xl:table-cell",
};

const DENSITY_CLASS = {
	comfortable: "px-3 py-4 first:pl-6 last:pr-6",
	compact: "px-3 py-3 first:pl-4 last:pr-4",
} as const;

export type DataTableProps<TData extends RowData> = {
	table: DataTableInstance<TData>;
	/** Rendered above the table, typically a `<DataTableToolbar>`. */
	toolbar?: ReactNode;
	/** Replaces the table when there are no rows to show. */
	empty?: ReactNode;
	/**
	 * Makes each row navigable. Return a bare `<Link>` — the arrow column, its
	 * label and the hover styling are added here.
	 */
	rowLink?: (row: TData) => ReactElement;
	density?: keyof typeof DENSITY_CLASS;
	bordered?: boolean;
	showPagination?: boolean;
	className?: string;
};

export function DataTable<TData extends RowData>({
	table,
	toolbar,
	empty,
	rowLink,
	density = "comfortable",
	bordered = true,
	showPagination = true,
	className,
}: DataTableProps<TData>) {
	const rows = table.getRowModel().rows;
	const cellPadding = DENSITY_CLASS[density];

	return (
		<div className={cn("space-y-4", className)}>
			{toolbar}

			{rows.length === 0 && empty ? (
				empty
			) : (
				<>
					<div className={cn("overflow-hidden", bordered && "rounded-2xl border")}>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map(headerGroup => (
									<TableRow key={headerGroup.id} className="bg-muted/50">
										{headerGroup.headers.map(header => {
											const meta = header.column.columnDef.meta;
											const align = meta?.align ?? "left";
											return (
												<TableHead
													key={header.id}
													colSpan={header.colSpan}
													className={cn(
														"text-muted-foreground h-auto text-xs font-medium tracking-wider whitespace-nowrap uppercase",
														cellPadding,
														ALIGN_CLASS[align],
														meta?.hideBelow && HIDE_BELOW_CLASS[meta.hideBelow],
														meta?.headerClassName
													)}
												>
													{header.isPlaceholder ? null : header.column.getCanSort() ? (
														<DataTableColumnHeader header={header} align={align} />
													) : (
														<FlexRender header={header} />
													)}
												</TableHead>
											);
										})}
										{rowLink && <TableHead className="w-10 pr-6" />}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{rows.map(row => {
									const link = rowLink?.(row.original);
									return (
										<TableRow key={row.id} className="group">
											{row.getVisibleCells().map(cell => {
												const meta = cell.column.columnDef.meta;
												return (
													<TableCell
														key={cell.id}
														className={cn(
															cellPadding,
															ALIGN_CLASS[meta?.align ?? "left"],
															meta?.hideBelow && HIDE_BELOW_CLASS[meta.hideBelow],
															meta?.cellClassName
														)}
													>
														<FlexRender cell={cell} />
													</TableCell>
												);
											})}
											{link && (
												<TableCell className="py-4 pr-6">
													{cloneElement(
														link,
														{ className: "inline-flex" } as never,
														<ArrowRightIcon className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
													)}
												</TableCell>
											)}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{showPagination && <DataTablePagination table={table} />}
				</>
			)}
		</div>
	);
}

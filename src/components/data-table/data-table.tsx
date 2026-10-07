import { cloneElement, useRef } from "react";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";

import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { FlexRender } from "@tanstack/react-table";
import type { Header, RowData } from "@tanstack/react-table";

import { InsetCard } from "@/components/ui/inset-card";
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
import type { DataTableFeatures } from "./features";
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

const MIN_COLUMN_WIDTH = 48;

const DENSITY_CLASS = {
	comfortable: "px-3 py-4 first:pl-6 last:pr-6",
	compact: "px-3 py-3 first:pl-4 last:pr-4",
} as const;

export type DataTableProps<TData extends RowData> = {
	table: DataTableInstance<TData>;
	toolbar?: ReactNode;
	empty?: ReactNode;
	/** Return a bare `<Link>`, or null for a row with nowhere to go. */
	rowLink?: (row: TData) => ReactElement | null;
	/** Makes the whole row a pointer target; keep `rowLink` too, since a row cannot take keyboard focus. */
	onRowClick?: (row: TData) => void;
	density?: keyof typeof DENSITY_CLASS;
	showPagination?: boolean;
	className?: string;
};

export function DataTable<TData extends RowData>({
	table,
	toolbar,
	empty,
	rowLink,
	onRowClick,
	density = "comfortable",
	showPagination = true,
	className,
}: DataTableProps<TData>) {
	const rows = table.getRowModel().rows;
	const cellPadding = DENSITY_CLASS[density];

	const resizable = Boolean(table.options.enableColumnResizing);
	const sized = resizable && Object.keys(table.state.columnSizing).length > 0;
	const headerCells = useRef(new Map<string, HTMLTableCellElement>());

	// The first resize freezes every column at the width it renders at, so nothing jumps to a default.
	const freezeWidths = () => {
		if (sized) return;
		const widths: Record<string, number> = {};
		for (const header of table.getFlatHeaders()) {
			const width = headerCells.current.get(header.id)?.offsetWidth;
			if (width) widths[header.column.id] = width;
		}
		table.setColumnSizing(widths);
	};

	const startResize = (
		header: Header<DataTableFeatures, TData, unknown>,
		event: unknown
	) => {
		freezeWidths();
		header.getResizeHandler()(event);
	};

	const resizeByKey = (
		header: Header<DataTableFeatures, TData, unknown>,
		event: KeyboardEvent
	) => {
		const step = event.key === "ArrowRight" ? 16 : event.key === "ArrowLeft" ? -16 : 0;
		if (!step) return;
		event.preventDefault();
		freezeWidths();
		table.setColumnSizing(old => ({
			...old,
			[header.column.id]: Math.max(
				header.column.columnDef.minSize ?? MIN_COLUMN_WIDTH,
				(old[header.column.id] ?? header.getSize()) + step
			),
		}));
	};

	const showEmpty = rows.length === 0 && empty;
	const showPager = showPagination && !showEmpty && table.getPageCount() > 1;

	return (
		<InsetCard
			className={className}
			header={toolbar}
			footer={showPager ? <DataTablePagination table={table} /> : undefined}
			bandClassName="px-2 py-2"
		>
			{showEmpty ? (
				empty
			) : (
				<div className="overflow-hidden">
					<Table className={sized ? "table-fixed" : undefined}>
						<TableHeader>
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id} className="group/head bg-muted/50">
									{headerGroup.headers.map(header => {
										const meta = header.column.columnDef.meta;
										const align = meta?.align ?? "left";
										return (
											<TableHead
												key={header.id}
												ref={element => {
													if (element) headerCells.current.set(header.id, element);
													else headerCells.current.delete(header.id);
												}}
												colSpan={header.colSpan}
												style={sized ? { width: header.getSize() } : undefined}
												className={cn(
													"text-muted-foreground eyebrow h-auto whitespace-nowrap",
													resizable && "relative",
													sized && "overflow-hidden text-ellipsis",
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
												{resizable && header.column.getCanResize() && (
													<div
														role="separator"
														aria-orientation="vertical"
														aria-label={`Larghezza di ${meta?.label ?? header.column.id}`}
														aria-valuenow={Math.round(header.getSize())}
														tabIndex={0}
														onMouseDown={event => startResize(header, event)}
														onTouchStart={event => startResize(header, event)}
														onDoubleClick={() => table.resetColumnSizing(true)}
														onKeyDown={event => resizeByKey(header, event)}
														className={cn(
															"focus-visible:bg-brand absolute inset-y-0 right-0 w-1.5 cursor-col-resize touch-none bg-transparent outline-none select-none",
															"group-hover/head:bg-border hover:bg-brand/60!",
															header.column.getIsResizing() && "bg-brand!"
														)}
													/>
												)}
											</TableHead>
										);
									})}
									{sized && <TableHead aria-hidden className="p-0" />}
									{rowLink && <TableHead className="w-10 pr-6" />}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{rows.map(row => {
								const link = rowLink?.(row.original);
								return (
									<TableRow
										key={row.id}
										className={cn("group", onRowClick && "cursor-pointer")}
										onClick={
											onRowClick &&
											(event => {
												if ((event.target as Element).closest("a, button")) return;
												onRowClick(row.original);
											})
										}
									>
										{row.getVisibleCells().map(cell => {
											const meta = cell.column.columnDef.meta;
											return (
												<TableCell
													key={cell.id}
													className={cn(
														cellPadding,
														ALIGN_CLASS[meta?.align ?? "left"],
														meta?.hideBelow && HIDE_BELOW_CLASS[meta.hideBelow],
														sized && "overflow-hidden",
														meta?.cellClassName
													)}
												>
													<FlexRender cell={cell} />
												</TableCell>
											);
										})}
										{sized && <TableCell aria-hidden className="p-0" />}
										{rowLink && (
											<TableCell className="py-4 pr-6">
												{link &&
													cloneElement(
														link,
														{ className: "inline-flex" } as never,
														<ArrowRightIcon className="text-muted-foreground/50 group-hover:text-brand h-4 w-4 transition-transform group-hover:translate-x-1" />
													)}
											</TableCell>
										)}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			)}
		</InsetCard>
	);
}

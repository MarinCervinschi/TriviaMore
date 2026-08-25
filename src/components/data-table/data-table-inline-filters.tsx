import { useState } from "react";
import type { ReactNode } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { FilterIcon } from "@solar-icons/react/linear/filter";
import type { Column, RowData } from "@tanstack/react-table";

import type { Icon } from "@/components/icons";
import { CheckGlyph, CloseGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { DataTableFacetCommand } from "./data-table-faceted-filter";
import { readFacet, writeFacet } from "./facet-filter";
import type {
	DataTableFacetOption,
	DataTableFeatures,
	DataTableInstance,
} from "./features";

type FacetColumn<TData extends RowData> = Column<DataTableFeatures, TData, any>;
type InlineSize = "sm" | "default";

/** A filter with no facet column behind it — a date range, say; its state lives with the host. */
export type CustomInlineFilter = {
	id: string;
	label: string;
	icon?: Icon;
	active: boolean;
	summary?: string;
	placeholder?: string;
	/** A render function receives `close`, so an «Applica» button can dismiss the chip. */
	popover?: ReactNode | ((close: () => void) => ReactNode);
	clear: () => void;
};

const OPERATOR = { include: "è uno di", exclude: "non è uno di" } as const;

const SIZE: Record<
	InlineSize,
	{ h: string; text: string; px: string; gap: string; icon: string; add: string }
> = {
	default: {
		h: "h-9",
		text: "text-sm",
		px: "px-2.5",
		gap: "gap-1.5",
		icon: "size-4",
		add: "h-9 w-9",
	},
	sm: {
		h: "h-8",
		text: "text-xs",
		px: "px-2",
		gap: "gap-1",
		icon: "size-3.5",
		add: "h-8 w-8",
	},
};

const segment =
	"hover:bg-muted/50 focus-visible:bg-muted/50 flex items-center transition-colors outline-none";

function facetOf<TData extends RowData>(column: FacetColumn<TData>) {
	const meta = column.columnDef.meta;
	return {
		title: meta?.label ?? column.id,
		options: meta?.facet?.options ?? [],
		icon: meta?.facet?.icon,
	};
}

function summarise(values: string[], options: DataTableFacetOption[]) {
	if (values.length === 0) return "Seleziona…";
	if (values.length > 2) return `${values.length} selezionati`;
	return values.map(v => options.find(o => o.value === v)?.label ?? v).join(", ");
}

function FilterOperatorSegment<TData extends RowData>({
	column,
	size,
}: {
	column: FacetColumn<TData>;
	size: InlineSize;
}) {
	const { exclude, values } = readFacet(column.getFilterValue());
	const s = SIZE[size];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(segment, s.px, "text-muted-foreground hover:text-foreground")}
				>
					{exclude ? OPERATOR.exclude : OPERATOR.include}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-40">
				{[false, true].map(next => (
					<DropdownMenuItem
						key={String(next)}
						onSelect={() => column.setFilterValue(writeFacet(next, values))}
						className="justify-between"
					>
						{next ? OPERATOR.exclude : OPERATOR.include}
						<CheckGlyph
							className={cn(
								"text-brand size-4",
								exclude === next ? "opacity-100" : "opacity-0"
							)}
						/>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function InlineFilterChip<TData extends RowData>({
	column,
	size,
	onRemove,
}: {
	column: FacetColumn<TData>;
	size: InlineSize;
	onRemove: () => void;
}) {
	const { title, options, icon: Icon } = facetOf(column);
	const { values } = readFacet(column.getFilterValue());
	const s = SIZE[size];

	return (
		<div
			className={cn(
				"border-border bg-background divide-border inline-flex items-stretch divide-x overflow-hidden rounded-lg border",
				s.h,
				s.text
			)}
		>
			<span className={cn("flex items-center font-medium", s.gap, s.px)}>
				{Icon && <Icon className={cn(s.icon, "text-muted-foreground")} />}
				{title}
			</span>

			<FilterOperatorSegment column={column} size={size} />

			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						className={cn(segment, s.px, s.gap, "text-muted-foreground")}
					>
						<span className="text-foreground max-w-40 truncate">
							{summarise(values, options)}
						</span>
						<AltArrowDownIcon className={cn(s.icon, "shrink-0")} />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-56 p-0" align="start">
					<DataTableFacetCommand column={column} title={title} options={options} />
				</PopoverContent>
			</Popover>

			<button
				type="button"
				onClick={onRemove}
				aria-label={`Rimuovi filtro ${title}`}
				className={cn(segment, "text-muted-foreground hover:text-foreground px-2")}
			>
				<CloseGlyph className={s.icon} />
			</button>
		</div>
	);
}

function CustomFilterChip({
	filter,
	size,
}: {
	filter: CustomInlineFilter;
	size: InlineSize;
}) {
	const [open, setOpen] = useState(false);
	const { icon: Icon } = filter;
	const s = SIZE[size];
	const value = filter.active
		? (filter.summary ?? "—")
		: (filter.placeholder ?? "Qualsiasi");

	return (
		<div
			className={cn(
				"border-border bg-background divide-border inline-flex items-stretch divide-x overflow-hidden rounded-lg border",
				s.h,
				s.text
			)}
		>
			<span className={cn("flex items-center font-medium", s.gap, s.px)}>
				{Icon && <Icon className={cn(s.icon, "text-muted-foreground")} />}
				{filter.label}
			</span>

			{filter.popover ? (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							className={cn(segment, s.px, s.gap, "text-muted-foreground")}
						>
							<span
								className={cn(
									"max-w-48 truncate",
									filter.active ? "text-foreground" : "text-muted-foreground"
								)}
							>
								{value}
							</span>
							<AltArrowDownIcon className={cn(s.icon, "shrink-0")} />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						{typeof filter.popover === "function"
							? filter.popover(() => setOpen(false))
							: filter.popover}
					</PopoverContent>
				</Popover>
			) : (
				<span
					className={cn(
						"flex items-center",
						s.px,
						filter.active ? "text-foreground" : "text-muted-foreground"
					)}
				>
					{value}
				</span>
			)}

			{filter.active && (
				<button
					type="button"
					onClick={filter.clear}
					aria-label={`Rimuovi filtro ${filter.label}`}
					className={cn(segment, "text-muted-foreground hover:text-foreground px-2")}
				>
					<CloseGlyph className={s.icon} />
				</button>
			)}
		</div>
	);
}

function FacetSubmenuItems<TData extends RowData>({
	column,
}: {
	column: FacetColumn<TData>;
}) {
	const facets = column.getFacetedUniqueValues();
	const { exclude, values } = readFacet(column.getFilterValue());
	const selected = new Set(values);
	const options = facetOf(column).options;

	function toggle(value: string) {
		const next = new Set(selected);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		column.setFilterValue(writeFacet(exclude, Array.from(next)));
	}

	return (
		<>
			{options.map(option => {
				const Icon = option.icon;
				const count = facets.get(option.value);
				return (
					<DropdownMenuCheckboxItem
						key={option.value}
						checked={selected.has(option.value)}
						onSelect={event => event.preventDefault()}
						onCheckedChange={() => toggle(option.value)}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2">
							{Icon && <Icon className="text-muted-foreground size-4 shrink-0" />}
							<span className="truncate" title={option.label}>
								{option.label}
							</span>
						</span>
						{count != null && (
							<span className="text-muted-foreground ml-2 shrink-0 text-xs tabular-nums">
								{count}
							</span>
						)}
					</DropdownMenuCheckboxItem>
				);
			})}
		</>
	);
}

function facetColumnsOf<TData extends RowData>(table: DataTableInstance<TData>) {
	return table.getAllColumns().filter(column => column.columnDef.meta?.facet);
}

function isActive<TData extends RowData>(column: FacetColumn<TData>) {
	return readFacet(column.getFilterValue()).values.length > 0;
}

export function DataTableInlineFilterChips<TData extends RowData>({
	table,
	size = "default",
	custom = [],
}: {
	table: DataTableInstance<TData>;
	size?: InlineSize;
	custom?: CustomInlineFilter[];
}) {
	const chips = facetColumnsOf(table).filter(isActive);
	if (chips.length === 0 && custom.length === 0) return null;

	return (
		<>
			{chips.map(column => (
				<InlineFilterChip
					key={column.id}
					column={column}
					size={size}
					onRemove={() => column.setFilterValue(undefined)}
				/>
			))}
			{custom.map(filter => (
				<CustomFilterChip key={filter.id} filter={filter} size={size} />
			))}
		</>
	);
}

/** The «＋ Filtro» control: one hover submenu per facet, with counts. */
export function DataTableInlineFilterAdd<TData extends RowData>({
	table,
	size = "default",
}: {
	table: DataTableInstance<TData>;
	size?: InlineSize;
}) {
	const s = SIZE[size];
	const columns = facetColumnsOf(table);
	if (columns.length === 0) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					aria-label="Aggiungi filtro"
					className={cn("shrink-0 p-0", s.add)}
				>
					<FilterIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				{columns.map(column => {
					const { title, icon: Icon } = facetOf(column);
					return (
						<DropdownMenuSub key={column.id}>
							<DropdownMenuSubTrigger className="gap-2">
								{Icon && <Icon className="text-muted-foreground size-4" />}
								{title}
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="max-h-80 max-w-80 min-w-52 overflow-y-auto">
								<FacetSubmenuItems column={column} />
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

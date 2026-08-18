import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import type { Column, RowData } from "@tanstack/react-table";

import { CheckGlyph } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { readFacet, writeFacet } from "./facet-filter";
import type { DataTableFacetOption, DataTableFeatures } from "./features";

type FacetColumn<TData extends RowData> = Column<DataTableFeatures, TData, any>;

/**
 * The checkable option rows behind a facet: one line per option with its count,
 * plus a "clear" footer. Marker-aware, so it preserves the include/exclude
 * operator when values are toggled (see `facet-filter`). Rendered inside a
 * `Command` — by the dashed toolbar button, the inline chip, and the «＋ Filtro»
 * menu — so every selection surface stays identical.
 */
export function FacetOptionsBody<TData extends RowData>({
	column,
	options,
}: {
	column: FacetColumn<TData>;
	options: DataTableFacetOption[];
}) {
	const facets = column.getFacetedUniqueValues();
	const { exclude, values } = readFacet(column.getFilterValue());
	const selected = new Set(values);

	function toggle(value: string) {
		const next = new Set(selected);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		column.setFilterValue(writeFacet(exclude, Array.from(next)));
	}

	return (
		<>
			<CommandGroup>
				{options.map(option => {
					const isSelected = selected.has(option.value);
					const Icon = option.icon;
					return (
						<CommandItem key={option.value} onSelect={() => toggle(option.value)}>
							<div
								className={cn(
									"border-primary flex h-4 w-4 items-center justify-center rounded-sm border",
									isSelected
										? "bg-primary text-primary-foreground"
										: "opacity-50 [&_svg]:invisible"
								)}
							>
								<CheckGlyph className="h-3 w-3" />
							</div>
							{Icon && <Icon className="text-muted-foreground h-4 w-4" />}
							<span className="truncate">{option.label}</span>
							{facets.get(option.value) != null && (
								<span className="text-muted-foreground ml-auto text-xs tabular-nums">
									{facets.get(option.value)}
								</span>
							)}
						</CommandItem>
					);
				})}
			</CommandGroup>
			{selected.size > 0 && (
				<>
					<CommandSeparator />
					<CommandGroup>
						<CommandItem
							onSelect={() => column.setFilterValue(undefined)}
							className="justify-center text-center"
						>
							Pulisci filtro
						</CommandItem>
					</CommandGroup>
				</>
			)}
		</>
	);
}

/**
 * A facet's searchable option list: `FacetOptionsBody` wrapped in its own
 * `Command` with a search input. Used by the dashed button and the chip's value
 * popover.
 */
export function DataTableFacetCommand<TData extends RowData>({
	column,
	title,
	options,
}: {
	column: FacetColumn<TData>;
	title: string;
	options: DataTableFacetOption[];
}) {
	return (
		<Command>
			<CommandInput placeholder={title} />
			<CommandList>
				<CommandEmpty>Nessun risultato.</CommandEmpty>
				<FacetOptionsBody column={column} options={options} />
			</CommandList>
		</Command>
	);
}

export function DataTableFacetedFilter<TData extends RowData>({
	column,
	title,
	options,
}: {
	column: FacetColumn<TData>;
	title: string;
	options: DataTableFacetOption[];
}) {
	const selected = new Set(readFacet(column.getFilterValue()).values);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 border-dashed">
					<AddCircleIcon className="h-4 w-4" />
					{title}
					{selected.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<div className="flex gap-1">
								{selected.size > 2 ? (
									<Badge variant="secondary" className="px-1.5 font-normal">
										{selected.size} selezionati
									</Badge>
								) : (
									options
										.filter(option => selected.has(option.value))
										.map(option => (
											<Badge
												key={option.value}
												variant="secondary"
												className="px-1.5 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-56 p-0" align="start">
				<DataTableFacetCommand column={column} title={title} options={options} />
			</PopoverContent>
		</Popover>
	);
}

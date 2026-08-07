import type { Column, RowData } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";

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

import type { DataTableFacetOption, DataTableFeatures } from "./features";

export function DataTableFacetedFilter<TData extends RowData>({
	column,
	title,
	options,
}: {
	column: Column<DataTableFeatures, TData, any>;
	title: string;
	options: DataTableFacetOption[];
}) {
	const facets = column.getFacetedUniqueValues();
	const filterValue = column.getFilterValue();
	const selected = new Set(Array.isArray(filterValue) ? (filterValue as string[]) : []);

	function toggle(value: string) {
		const next = new Set(selected);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		column.setFilterValue(next.size ? Array.from(next) : undefined);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 rounded-xl border-dashed">
					<PlusCircle className="h-4 w-4" />
					{title}
					{selected.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<div className="flex gap-1">
								{selected.size > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-full px-1.5 font-normal"
									>
										{selected.size} selezionati
									</Badge>
								) : (
									options
										.filter(option => selected.has(option.value))
										.map(option => (
											<Badge
												key={option.value}
												variant="secondary"
												className="rounded-full px-1.5 font-normal"
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
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>Nessun risultato.</CommandEmpty>
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
											<Check className="h-3 w-3" />
										</div>
										{Icon && <Icon className="text-muted-foreground h-4 w-4" />}
										<span className="truncate">{option.label}</span>
										{facets.get(option.value) != null && (
											<span className="text-muted-foreground ml-auto font-mono text-xs">
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
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

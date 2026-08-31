import type { ReactNode } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";

import type { Icon } from "@/components/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ChipOption<T extends string> = {
	value: T;
	label: string;
	icon?: Icon;
	glyph?: ReactNode;
};

/**
 * A single-select chip, reading like the data-table filter chips: the current
 * value *is* the label, so the control says what it is showing without a legend
 * beside it.
 */
export function SelectChip<T extends string>({
	label,
	value,
	onChange,
	options,
	lead: Lead,
}: {
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: ChipOption<T>[];
	lead?: Icon;
}) {
	const current = options.find(option => option.value === value);
	const CurrentIcon = current?.icon;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className="border-border bg-background hover:bg-muted/50 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors"
				>
					{Lead ? (
						<Lead className="text-muted-foreground size-3.5" />
					) : CurrentIcon ? (
						<CurrentIcon className="text-muted-foreground size-3.5" />
					) : (
						current?.glyph
					)}
					<span className="font-medium">{current?.label ?? label}</span>
					<AltArrowDownIcon className="text-muted-foreground size-3.5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-40">
				<DropdownMenuLabel>{label}</DropdownMenuLabel>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={next => onChange(next as T)}
				>
					{options.map(option => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

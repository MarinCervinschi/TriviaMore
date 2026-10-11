import { CheckGlyph } from "@/components/icons";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface PickerOption {
	id: string;
	name: string;
	meta?: string;
	/** Matched by the search besides the name, such as a code or an acronym. */
	keywords?: string;
}

export function OnboardingPicker({
	options,
	value,
	onSelect,
	placeholder,
	emptyLabel,
	className,
}: {
	options: PickerOption[];
	value?: string | null;
	onSelect: (id: string) => void;
	placeholder: string;
	emptyLabel: string;
	className?: string;
}) {
	const row = (option: PickerOption) => (
		<CommandItem
			key={option.id}
			value={option.id}
			keywords={[option.name, option.keywords ?? ""]}
			onSelect={() => onSelect(option.id)}
			className="aria-selected:bg-accent gap-3 px-3 py-2.5"
		>
			<span
				aria-hidden
				className={cn(
					"flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
					value === option.id ? "bg-primary text-primary-foreground" : "border"
				)}
			>
				{value === option.id && <CheckGlyph className="size-3.5" />}
			</span>
			<span className="min-w-0 flex-1 truncate">{option.name}</span>
			{option.meta && (
				<span className="text-muted-foreground shrink-0 text-xs">{option.meta}</span>
			)}
		</CommandItem>
	);

	return (
		<Command className={cn("bg-transparent", className)}>
			<CommandInput placeholder={placeholder} />
			<CommandList className="max-h-72">
				<CommandEmpty>{emptyLabel}</CommandEmpty>
				{options.length > 0 && <CommandGroup>{options.map(row)}</CommandGroup>}
			</CommandList>
		</Command>
	);
}

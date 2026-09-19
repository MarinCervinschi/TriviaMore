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
	/** Right-aligned, secondary: a course type and its CFU, a campus, a count. */
	meta?: string;
	/** Matched by the search on top of the name — a code, an acronym. */
	keywords?: string;
}

/** Suggestions come first under their own heading and are left out of "Tutti",
 *  so an option is offered once whichever group it lands in. */
export function OnboardingPicker({
	options,
	suggestions = [],
	value,
	onSelect,
	placeholder,
	emptyLabel,
	suggestionsLabel = "Suggeriti per te",
	allLabel = "Tutti",
	className,
}: {
	options: PickerOption[];
	suggestions?: PickerOption[];
	value?: string | null;
	onSelect: (id: string) => void;
	placeholder: string;
	emptyLabel: string;
	suggestionsLabel?: string;
	allLabel?: string;
	className?: string;
}) {
	const suggestedIds = new Set(suggestions.map(option => option.id));
	const rest = options.filter(option => !suggestedIds.has(option.id));

	const row = (option: PickerOption, group: string) => (
		<CommandItem
			key={`${group}-${option.id}`}
			value={`${group}-${option.id}`}
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
				{suggestions.length > 0 && (
					<CommandGroup heading={suggestionsLabel}>
						{suggestions.map(option => row(option, "suggested"))}
					</CommandGroup>
				)}
				{rest.length > 0 && (
					<CommandGroup heading={suggestions.length > 0 ? allLabel : undefined}>
						{rest.map(option => row(option, "all"))}
					</CommandGroup>
				)}
			</CommandList>
		</Command>
	);
}

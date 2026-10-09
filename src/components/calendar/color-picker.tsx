import { CheckGlyph } from "@/components/icons";
import { ENTRY_COLORS, type EntryColor } from "@/lib/crm/schemas";
import { cn } from "@/lib/utils";

const COLOR_LABELS: Record<EntryColor, string> = {
	"chart-1": "Corallo",
	"chart-2": "Blu",
	"chart-3": "Verde",
	"chart-4": "Viola",
	"chart-5": "Ocra",
};

/** The colours an entry can take; null is the kind's own, drawn as the first swatch. */
export function ColorPicker({
	value,
	fallback,
	onChange,
}: {
	value: EntryColor | null;
	/** The kind's own colour, shown on the "Predefinito" swatch. */
	fallback: EntryColor;
	onChange: (value: EntryColor | null) => void;
}) {
	const options: { value: EntryColor | null; label: string; swatch: EntryColor }[] = [
		{
			value: null,
			label: `Predefinito (${COLOR_LABELS[fallback].toLowerCase()})`,
			swatch: fallback,
		},
		...ENTRY_COLORS.filter(color => color !== fallback).map(color => ({
			value: color,
			label: COLOR_LABELS[color],
			swatch: color,
		})),
	];
	return (
		<div
			role="radiogroup"
			aria-label="Colore"
			className="flex flex-wrap items-center gap-2"
		>
			{options.map(option => {
				const selected = option.value === value;
				return (
					<button
						key={option.value ?? "default"}
						type="button"
						role="radio"
						aria-checked={selected}
						aria-label={option.label}
						title={option.label}
						onClick={() => onChange(option.value)}
						className={cn(
							"focus-visible:ring-ring ring-offset-background text-primary-foreground flex size-7 items-center justify-center rounded-full transition-shadow focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
							selected && "ring-foreground ring-2 ring-offset-2"
						)}
						style={{ background: `var(--color-${option.swatch})` }}
					>
						{selected && <CheckGlyph className="size-3.5" />}
					</button>
				);
			})}
		</div>
	);
}

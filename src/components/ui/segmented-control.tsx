import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
	value: T;
	label: string;
	count?: number;
	icon?: Icon;
};

export function SegmentedControl<T extends string>({
	label,
	value,
	onChange,
	options,
	size = "default",
	iconOnly = false,
	className,
}: {
	/** The group's accessible name. */
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: SegmentedOption<T>[];
	size?: "default" | "lg" | "sm";
	iconOnly?: boolean;
	className?: string;
}) {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(
				"bg-muted inline-flex items-center gap-0.5 rounded-xl p-1",
				className
			)}
		>
			{options.map(option => {
				const selected = option.value === value;
				const Glyph = option.icon;
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={selected}
						onClick={() => onChange(option.value)}
						className={cn(
							"focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-lg text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
							size === "lg" ? "h-10" : size === "sm" ? "h-6" : "h-7",
							iconOnly ? "aspect-square justify-center px-0" : "px-3",
							selected
								? "bg-card text-foreground font-semibold shadow-xs"
								: "text-muted-foreground hover:text-foreground font-medium"
						)}
					>
						{Glyph && <Glyph className="size-4 shrink-0" aria-hidden />}
						<span className={cn(iconOnly && "sr-only")}>{option.label}</span>
						{option.count !== undefined && (
							<span className="text-muted-foreground font-medium tabular-nums">
								{option.count}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}

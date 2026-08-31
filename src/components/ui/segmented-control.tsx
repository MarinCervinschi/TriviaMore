import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
	value: T;
	label: string;
	/** Shown beside the label, in muted ink — the size of what the segment selects. */
	count?: number;
};

/**
 * A single-select filter that shows every choice at once, for the two or three
 * options a list is worth slicing by. `SelectChip` is the one to reach for past
 * that, where the current value has to stand in for a menu.
 *
 * The frame is a control and the segments are controls inside it, so the radius
 * steps down by the padding: `rounded-xl p-1` outside, `rounded-lg` in.
 */
export function SegmentedControl<T extends string>({
	label,
	value,
	onChange,
	options,
	size = "default",
	className,
}: {
	/** Names the group for a screen reader — the segments only name themselves. */
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: SegmentedOption<T>[];
	/** `lg` for a touch target on a phone. */
	size?: "default" | "lg";
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
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={selected}
						onClick={() => onChange(option.value)}
						className={cn(
							"focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
							size === "lg" ? "h-10" : "h-7",
							selected
								? "bg-card text-foreground font-semibold shadow-xs"
								: "text-muted-foreground hover:text-foreground font-medium"
						)}
					>
						{option.label}
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

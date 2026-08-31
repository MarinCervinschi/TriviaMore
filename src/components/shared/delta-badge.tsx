import { ArrowDownIcon } from "@solar-icons/react/linear/arrow-down";
import { ArrowUpIcon } from "@solar-icons/react/linear/arrow-up";

import { cn } from "@/lib/utils";

type DeltaUnit = "percent" | "points" | "raw";

const SUFFIX: Record<DeltaUnit, string> = { percent: "%", points: " pt", raw: "" };

/**
 * The change against the previous window, as a coloured pill. `null` renders
 * nothing: a metric with no baseline must not read as "no change", which is a
 * real measurement. The caller rounds — this only formats and tints.
 */
export function DeltaBadge({
	value,
	unit = "percent",
	className,
}: {
	value: number | null;
	unit?: DeltaUnit;
	className?: string;
}) {
	if (value === null) return null;

	const Arrow = value > 0 ? ArrowUpIcon : value < 0 ? ArrowDownIcon : null;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-xs font-semibold tabular-nums",
				value > 0
					? "text-success bg-success/10"
					: value < 0
						? "text-danger bg-danger/10"
						: "text-muted-foreground bg-muted",
				className
			)}
		>
			{Arrow && <Arrow className="size-3" />}
			{value > 0 ? "+" : ""}
			{value}
			{SUFFIX[unit]}
		</span>
	);
}

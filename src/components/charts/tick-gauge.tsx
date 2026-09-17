import { cn } from "@/lib/utils";

/**
 * A value read as a count of filled marks rather than as a sweep — which is what a
 * threshold actually is. The geometry is a constant for the reason `ScoreRing`
 * gives beside its own: a float differing between container and browser breaks
 * hydration, and only in production.
 */
const ARC_TICKS = [
	[15.0, 50.0, 5.0, 50.0],
	[15.18, 46.46, 5.23, 45.45],
	[15.72, 42.95, 5.92, 40.94],
	[16.61, 39.52, 7.06, 36.53],
	[17.84, 36.2, 8.65, 32.25],
	[19.4, 33.01, 10.65, 28.16],
	[21.27, 30.01, 13.07, 24.29],
	[23.44, 27.2, 15.86, 20.69],
	[25.89, 24.63, 19.0, 17.38],
	[28.58, 22.32, 22.46, 14.42],
	[31.49, 20.3, 26.2, 11.81],
	[34.59, 18.58, 30.18, 9.6],
	[37.84, 17.18, 34.37, 7.8],
	[41.23, 16.12, 38.72, 6.44],
	[44.7, 15.4, 43.19, 5.52],
	[48.23, 15.04, 47.72, 5.06],
	[51.77, 15.04, 52.28, 5.06],
	[55.3, 15.4, 56.81, 5.52],
	[58.77, 16.12, 61.28, 6.44],
	[62.16, 17.18, 65.63, 7.8],
	[65.41, 18.58, 69.82, 9.6],
	[68.51, 20.3, 73.8, 11.81],
	[71.42, 22.32, 77.54, 14.42],
	[74.11, 24.63, 81.0, 17.38],
	[76.56, 27.2, 84.14, 20.69],
	[78.73, 30.01, 86.93, 24.29],
	[80.6, 33.01, 89.35, 28.16],
	[82.16, 36.2, 91.35, 32.25],
	[83.39, 39.52, 92.94, 36.53],
	[84.28, 42.95, 94.08, 40.94],
	[84.82, 46.46, 94.77, 45.45],
	[85.0, 50.0, 95.0, 50.0],
] as const;

const ARC_TOTAL = ARC_TICKS.length;

export function TickArc({
	value,
	max,
	label,
	caption,
	className,
}: {
	value: number;
	max: number;
	/** The figure in the middle. Falls back to `value / max`. */
	label?: string;
	caption?: string;
	className?: string;
}) {
	const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
	const filled = Math.round(ratio * ARC_TOTAL);

	return (
		<div className={cn("relative shrink-0", className)}>
			<svg viewBox="0 0 100 62" className="w-full" role="img" aria-label={caption}>
				{ARC_TICKS.map(([x1, y1, x2, y2], index) => (
					<line
						key={x1 + "-" + y1}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						strokeWidth={3.2}
						strokeLinecap="round"
						className={index < filled ? "stroke-primary" : "stroke-border"}
					/>
				))}
				<text
					x="50"
					y="47"
					textAnchor="middle"
					className="fill-foreground text-[19px] font-bold tabular-nums"
				>
					{label ?? value}
				</text>
				<text
					x="50"
					y="58"
					textAnchor="middle"
					className="fill-muted-foreground text-[8px]"
				>
					{caption ?? `di ${max}`}
				</text>
			</svg>
		</div>
	);
}

const BAR_TICKS = 36;
const BAR_INDEXES = Array.from({ length: BAR_TICKS }, (_, index) => index);

/** The linear half: flex children, so it reflows at any width. */
export function TickBar({
	value,
	max,
	tone = "brand",
	className,
}: {
	value: number;
	max: number;
	/** `brand` for the page's own progress, `current` to take the accent around it. */
	tone?: "brand" | "current";
	className?: string;
}) {
	const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
	const filled = Math.round(ratio * BAR_TICKS);

	return (
		<div
			className={cn("flex h-4 items-stretch gap-[3px]", className)}
			role="progressbar"
			aria-valuenow={Math.round(ratio * 100)}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			{BAR_INDEXES.map(index => (
				<span
					key={index}
					className={cn(
						"flex-1 rounded-full",
						index < filled
							? tone === "brand"
								? "bg-primary"
								: "bg-current"
							: tone === "brand"
								? "bg-border"
								: "bg-current/20"
					)}
				/>
			))}
		</div>
	);
}

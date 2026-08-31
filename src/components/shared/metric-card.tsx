import type { ReactNode } from "react";

import type { Icon } from "@/components/icons";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { CardTitle, type TexturePlacement } from "@/components/ui/card";
import { InsetCard } from "@/components/ui/inset-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// The figures inside the comparison line carry it — "vs **61** nel periodo
// precedente" reads at a glance, the words only on a second pass. Splitting on a
// capturing group puts every match on an odd index, which is why the parity is the
// test: `FIGURE.test()` would walk `lastIndex` and alternate between calls.
const FIGURE = /(\d[\d.,/]*(?:%|pt|h|m|s)?)/gi;

function withFigures(text: string): ReactNode[] {
	return text.split(FIGURE).map((part, i) =>
		i % 2 === 1 ? (
			<span key={i} className="text-foreground font-semibold">
				{part}
			</span>
		) : (
			part
		)
	);
}

/**
 * A single headline figure with its change and what it is being compared against.
 * The sibling of `StatCard`: that one is a decorative tile for a count, this one
 * is a measurement — it always carries its baseline, so the number is readable.
 */
export function MetricCard({
	label,
	value,
	unit,
	icon: LeadIcon,
	tint,
	delta = null,
	deltaUnit,
	comparison,
	texture = "tr",
	className,
}: {
	label: string;
	value: string | number;
	/** Rendered smaller and muted right after the value: "/33", "%". */
	unit?: string;
	icon?: Icon;
	/** A chart slot class for the icon — the level's identity, not a status. */
	tint?: string;
	delta?: number | null;
	deltaUnit?: "percent" | "points" | "raw";
	/** The baseline in words: "vs 61 nel periodo precedente". Figures are lifted. */
	comparison?: ReactNode;
	/** Where the pixel field sits; `null` leaves the card bare. */
	texture?: TexturePlacement | null;
	className?: string;
}) {
	return (
		// No header band, and a slightly larger icon: the headline row reads as its
		// own family, a step apart from the cards that carry a chart.
		<InsetCard className={className} texture={texture}>
			<div className="relative flex flex-1 flex-col gap-2.5 p-4">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="truncate text-sm">{label}</CardTitle>
					{LeadIcon && (
						<LeadIcon
							className={cn("size-5 shrink-0", tint ?? "text-muted-foreground")}
						/>
					)}
				</div>

				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<span className="text-2xl font-bold tracking-tight tabular-nums">
						{value}
						{unit && (
							<span className="text-muted-foreground ml-0.5 text-base font-semibold">
								{unit}
							</span>
						)}
					</span>
					<DeltaBadge value={delta} unit={deltaUnit} />
				</div>

				{comparison && (
					<div className="mt-auto flex flex-col gap-2.5">
						<Separator />
						<p className="text-muted-foreground text-xs tabular-nums">
							{typeof comparison === "string" ? withFigures(comparison) : comparison}
						</p>
					</div>
				)}
			</div>
		</InsetCard>
	);
}

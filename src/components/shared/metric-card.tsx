import type { ReactNode } from "react";

import type { Icon } from "@/components/icons";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { CardTitle, type TexturePlacement } from "@/components/ui/card";
import { InsetCard } from "@/components/ui/inset-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// A global regex's `test()` walks `lastIndex`, so matches are found by their odd index after `split`.
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
	unit?: string;
	icon?: Icon;
	tint?: string;
	delta?: number | null;
	deltaUnit?: "percent" | "points" | "raw";
	comparison?: ReactNode;
	/** `null` leaves the card bare. */
	texture?: TexturePlacement | null;
	className?: string;
}) {
	return (
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

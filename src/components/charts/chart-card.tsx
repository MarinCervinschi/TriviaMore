import type * as React from "react";
import type { ReactNode } from "react";

import { CardTexture, CardTitle } from "@/components/ui/card";
import { InsetCard } from "@/components/ui/inset-card";
import { cn } from "@/lib/utils";

export type ChartCardProps = {
	title?: ReactNode;
	description?: string;
	/** Rendered at the top right — a filter, a range switch, a link. */
	actions?: ReactNode;
	/** Rendered under the plot — a legend list, a total, a caveat. */
	footer?: ReactNode;
	/** The pixel field, in the panel. Off by default: a plot is busy enough. */
	texture?: React.ComponentProps<typeof CardTexture>["placement"];
	className?: string;
	children: ReactNode;
};

/**
 * The shell every chart shares, so a plot dropped into any page arrives with the
 * same heading, padding and framing. The heading and the footer ride on the
 * frame, the plot sits in the panel: a reader can tell chrome from data without
 * reading either.
 */
export function ChartCard({
	title,
	description,
	actions,
	footer,
	texture,
	className,
	children,
}: ChartCardProps) {
	return (
		<InsetCard
			className={cn("h-full", className)}
			header={
				(title || actions) && (
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							{title && <CardTitle className="text-base">{title}</CardTitle>}
							{description && (
								<p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
							)}
						</div>
						{actions && (
							<div className="flex shrink-0 items-center gap-2">{actions}</div>
						)}
					</div>
				)
			}
			footer={footer}
			panelClassName={texture ? "relative" : undefined}
		>
			{texture && <CardTexture placement={texture} alpha={0.12} />}
			<div className="relative flex flex-1 flex-col justify-center gap-4 p-4">
				{children}
			</div>
		</InsetCard>
	);
}

/**
 * Shared plot chrome: the page's own dot grid, held far back so it reads as
 * paper rather than as a second set of gridlines.
 */
export const CHART_PLOT_CLASS =
	"[&_.recharts-cartesian-axis-tick_text]:tabular-nums " +
	"[&_.recharts-cartesian-axis-tick_text]:text-xs";

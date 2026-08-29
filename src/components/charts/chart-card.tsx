import type { ReactNode } from "react";

import type { TexturePlacement } from "@/components/ui/card";
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
	texture?: TexturePlacement;
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
			title={title}
			description={description}
			actions={actions}
			footer={footer}
			texture={texture}
			textureAlpha={0.12}
		>
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

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChartCardProps = {
	title?: string;
	description?: string;
	/** Rendered at the top right — a filter, a range switch, a link. */
	actions?: ReactNode;
	/** Rendered under the plot — a legend list, a total, a caveat. */
	footer?: ReactNode;
	/**
	 * The blurred brand orb behind the plot, the same device the hero and the
	 * empty states use. Off for a chart that sits inside another card.
	 */
	accent?: boolean;
	className?: string;
	children: ReactNode;
};

/**
 * The shell every chart shares, so a plot dropped into any page arrives with the
 * same heading, padding and framing.
 */
export function ChartCard({
	title,
	description,
	actions,
	footer,
	accent = true,
	className,
	children,
}: ChartCardProps) {
	return (
		<Card
			className={cn(
				"relative flex h-full flex-col overflow-hidden rounded-2xl",
				className
			)}
		>
			{accent && (
				<div
					aria-hidden
					className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-[80px]"
				/>
			)}
			{(title || actions) && (
				<CardHeader className="relative pb-2">
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
				</CardHeader>
			)}
			<CardContent className="relative flex flex-1 flex-col justify-center gap-4 pb-6">
				{children}
				{footer}
			</CardContent>
		</Card>
	);
}

/**
 * Shared plot chrome: the page's own dot grid, held far back so it reads as
 * paper rather than as a second set of gridlines.
 */
export const CHART_PLOT_CLASS =
	"[&_.recharts-cartesian-axis-tick_text]:tabular-nums " +
	"[&_.recharts-cartesian-axis-tick_text]:text-xs";

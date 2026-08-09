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
	className,
	children,
}: ChartCardProps) {
	return (
		<Card className={cn("flex h-full flex-col rounded-2xl", className)}>
			{(title || actions) && (
				<CardHeader className="pb-2">
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
			<CardContent className="flex flex-1 flex-col justify-center gap-4 pb-6">
				{children}
				{footer}
			</CardContent>
		</Card>
	);
}

export function ChartEmpty({
	message = "Nessun dato da mostrare.",
}: {
	message?: string;
}) {
	return <p className="text-muted-foreground py-10 text-center text-sm">{message}</p>;
}

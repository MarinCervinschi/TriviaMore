import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A surface set inside a frame: the muted band around the edge reads as the card
 * being *held* rather than drawn, and the band can grow on either side to carry a
 * header or a footer. It is the recipe four places had hand-rolled (the rollup,
 * the explorer, the rhythm panel, the mastery blocks), with the two slots added.
 *
 * The radii step down with the padding — 20 outside, 4 of frame, 16 inside — so
 * the two arcs share a centre, which is what makes the inset read as one object.
 */
export function InsetCard({
	header,
	footer,
	children,
	className,
	panelClassName,
	bandClassName,
}: {
	/** Sits on the frame, above the panel. */
	header?: ReactNode;
	/** Sits on the frame, below the panel. */
	footer?: ReactNode;
	children: ReactNode;
	className?: string;
	panelClassName?: string;
	/** Padding and type for both bands, when the default does not fit. */
	bandClassName?: string;
}) {
	const band = cn("px-3.5 py-2.5 text-sm", bandClassName);
	return (
		<div
			className={cn(
				"bg-muted/40 border-border/60 flex flex-col rounded-2xl border p-1 shadow-xs",
				className
			)}
		>
			{header && <div className={band}>{header}</div>}
			<div
				className={cn(
					"bg-card border-border/50 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border",
					panelClassName
				)}
			>
				{children}
			</div>
			{footer && <div className={band}>{footer}</div>}
		</div>
	);
}

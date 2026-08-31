import type { ReactNode } from "react";

import { CardTexture, CardTitle, type TexturePlacement } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A surface set inside a frame: the muted band around the edge reads as the card
 * being *held* rather than drawn, and the band can grow on either side to carry a
 * header or a footer.
 *
 * The radii step down with the padding — 20 outside, 4 of frame, 16 inside — so
 * the two arcs share a centre, which is what makes the inset read as one object.
 */
export function InsetCard({
	title,
	description,
	actions,
	header,
	footer,
	texture,
	textureAlpha = 0.18,
	children,
	className,
	panelClassName,
	bandClassName,
}: {
	title?: ReactNode;
	description?: ReactNode;
	/** Top right of the header band — a filter, a range switch, a link. */
	actions?: ReactNode;
	/** Replaces the header band built from `title`, when it needs its own shape. */
	header?: ReactNode;
	/** Sits on the frame, below the panel. */
	footer?: ReactNode;
	/** The pixel field, inside the panel. Off by default. */
	texture?: TexturePlacement | null;
	/** 0.12 under a plot, which is busy enough; 0.18–0.2 on a panel of figures. */
	textureAlpha?: number;
	children: ReactNode;
	className?: string;
	panelClassName?: string;
	/** Padding and type for both bands, when the default does not fit. */
	bandClassName?: string;
}) {
	const band = cn("px-3.5 py-2.5 text-sm", bandClassName);
	const heading =
		header ??
		((title || description || actions) && (
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					{title && <CardTitle className="text-base">{title}</CardTitle>}
					{description && (
						<p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
					)}
				</div>
				{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
			</div>
		));

	return (
		<div
			className={cn(
				"bg-muted/40 border-border/60 flex flex-col rounded-2xl border p-1 shadow-xs",
				className
			)}
		>
			{heading && <div className={band}>{heading}</div>}
			<div
				className={cn(
					"bg-card border-border/50 relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border",
					panelClassName
				)}
			>
				{texture && <CardTexture placement={texture} alpha={textureAlpha} />}
				{children}
			</div>
			{footer && <div className={band}>{footer}</div>}
		</div>
	);
}

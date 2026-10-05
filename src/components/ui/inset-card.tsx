import type { ReactNode } from "react";

import { CardTexture, CardTitle, type TexturePlacement } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// The radii step down with the padding (20, 4 of frame, 16) so the two arcs share a centre.
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
	actions?: ReactNode;
	/** Replaces the header band built from `title`, when it needs its own shape. */
	header?: ReactNode;
	footer?: ReactNode;
	texture?: TexturePlacement | null;
	/** 0.12 under a plot; 0.18–0.2 on a panel of figures. */
	textureAlpha?: number;
	children: ReactNode;
	className?: string;
	panelClassName?: string;
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

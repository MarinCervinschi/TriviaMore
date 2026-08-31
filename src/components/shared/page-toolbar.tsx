import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The page's head where there is no hero: the trail on top, the name of the page
 * with its controls beside it, and a rule under the whole thing. It says what the
 * page is in one line and gives the rest of the fold to the data.
 */
export function PageToolbar({
	breadcrumb,
	title,
	badge,
	meta,
	actions,
	className,
}: {
	breadcrumb?: ReactNode;
	title?: ReactNode;
	/** A chip beside the title — what kind of thing this page is about. */
	badge?: ReactNode;
	/** The line under the title: where the entity sits, what it covers. */
	meta?: ReactNode;
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("border-border/60 space-y-5 border-b pb-4", className)}>
			{breadcrumb}

			<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
				<div className="min-w-0">
					{title && (
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
							{badge}
						</div>
					)}
					{meta && <p className="text-muted-foreground mt-1 text-sm">{meta}</p>}
				</div>

				{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
}

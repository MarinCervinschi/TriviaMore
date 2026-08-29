import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The compact page head: the breadcrumb on the left, the page's own controls on
 * the right, one row. It replaces a hero where the space above the fold is worth
 * more as controls than as a large title — the breadcrumb already names the page.
 */
export function PageToolbar({
	breadcrumb,
	actions,
	className,
}: {
	breadcrumb?: ReactNode;
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-x-3 gap-y-2",
				className
			)}
		>
			{breadcrumb}
			{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
		</div>
	);
}

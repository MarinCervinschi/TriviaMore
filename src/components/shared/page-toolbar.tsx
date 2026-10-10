import type { ReactNode } from "react";

import { TabNav, type TabNavItem } from "@/components/ui/tab-nav";
import { cn } from "@/lib/utils";

export function PageToolbar({
	title,
	badge,
	meta,
	metrics,
	tabs,
	actions,
	className,
}: {
	title?: ReactNode;
	badge?: ReactNode;
	meta?: ReactNode;
	metrics?: { label: string; value: string | number }[];
	tabs?: TabNavItem[];
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("space-y-3", className)}>
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

			{tabs && tabs.length > 0 && <TabNav label="Sezioni" tabs={tabs} />}

			{metrics && metrics.length > 0 && (
				<div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
					{metrics.map((metric, index) => (
						<span key={metric.label} className="flex items-center gap-2">
							{index > 0 && (
								<span className="bg-muted-foreground/30 mr-1 h-1 w-1 rounded-full" />
							)}
							<span className="text-foreground font-semibold">{metric.value}</span>
							{metric.label}
						</span>
					))}
				</div>
			)}
		</div>
	);
}

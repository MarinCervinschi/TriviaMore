import type { ReactNode } from "react";

import type { TexturePlacement } from "@/components/ui/card";
import { InsetCard } from "@/components/ui/inset-card";
import { cn } from "@/lib/utils";

export type ChartCardProps = {
	title?: ReactNode;
	description?: string;
	actions?: ReactNode;
	footer?: ReactNode;
	texture?: TexturePlacement;
	className?: string;
	children: ReactNode;
};

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

export const CHART_PLOT_CLASS =
	"[&_.recharts-cartesian-axis-tick_text]:tabular-nums " +
	"[&_.recharts-cartesian-axis-tick_text]:text-xs";

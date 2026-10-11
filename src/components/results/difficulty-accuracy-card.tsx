import type { ReactNode } from "react";

import { DifficultyBar } from "@/components/shared/difficulty-bar";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { MasteryBreakdown } from "@/lib/user/types";

/** The points by difficulty, as the attempt was graded. */
export function DifficultyAccuracyCard({
	byDifficulty,
	footer,
	className,
}: {
	/** Shown in the order given, easy to hard. */
	byDifficulty: MasteryBreakdown[];
	footer?: ReactNode;
	className?: string;
}) {
	return (
		<InsetCard
			title="Accuratezza per difficoltà"
			className={className}
			panelClassName="h-full"
			footer={footer}
		>
			{byDifficulty.length === 0 ? (
				<InlineEmpty>Nessuna domanda con una difficoltà assegnata.</InlineEmpty>
			) : (
				<TooltipProvider delayDuration={150}>
					<div className="space-y-4 p-5">
						{byDifficulty.map(row => (
							<DifficultyBar key={row.key} row={row} layout="stacked" showCounts />
						))}
					</div>
				</TooltipProvider>
			)}
		</InsetCard>
	);
}

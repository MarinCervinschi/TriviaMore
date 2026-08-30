import type { ReactNode } from "react";

import { DifficultyBar } from "@/components/shared/difficulty-bar";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { MasteryBreakdown } from "@/lib/user/types";

/**
 * Where the points went, by difficulty. The verdict is frozen on the answer, so
 * this is the attempt as it was graded — not a re-read of the questions as they
 * stand now.
 */
export function DifficultyAccuracyCard({
	byDifficulty,
	footer,
	className,
}: {
	/** Easy to hard: the order is the caller's, and it is the order shown. */
	byDifficulty: MasteryBreakdown[];
	/** The one line worth drawing out of the three bars. */
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

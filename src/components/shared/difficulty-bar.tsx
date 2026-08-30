import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MasteryBreakdown } from "@/lib/user/types";
import { getDifficultyLabel } from "@/lib/user/utils";
import { cn } from "@/lib/utils";

/** Accuracy read as an outcome: the same three steps wherever a share is scored. */
export function accuracyTone(pct: number) {
	if (pct >= 75) return { fill: "var(--color-success)", ink: "text-success" };
	if (pct >= 50) return { fill: "var(--color-warning)", ink: "text-warning" };
	return { fill: "var(--color-destructive)", ink: "text-danger" };
}

export function pctOf(correct: number, total: number) {
	return total === 0 ? 0 : Math.round((correct / total) * 100);
}

const DIFFICULTY_STEPS: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

/**
 * Three rising bars, the first `n` filled: the difficulty ladder as a shape,
 * because in this row colour already means accuracy and cannot mean two things.
 */
export function DifficultyMeter({ level }: { level: string }) {
	const filled = DIFFICULTY_STEPS[level] ?? 0;
	return (
		<span className="flex items-end gap-[2px]" aria-hidden>
			{[3, 5, 7].map((height, index) => (
				<span
					key={height}
					className={cn(
						"bg-muted-foreground w-[3px] rounded-[1px]",
						index < filled ? "opacity-100" : "opacity-25"
					)}
					style={{ height }}
				/>
			))}
		</span>
	);
}

/**
 * One difficulty's accuracy. Needs a `TooltipProvider` above it: the counts behind
 * the percentage live in the tooltip in the `inline` layout.
 */
export function DifficultyBar({
	row,
	layout = "inline",
	showCounts = false,
}: {
	row: MasteryBreakdown;
	/** `stacked` puts the bar on its own line — for a narrow column. */
	layout?: "inline" | "stacked";
	/** `stacked` only: spells the counts out beside the share instead of leaving them to the tooltip. */
	showCounts?: boolean;
}) {
	const pct = pctOf(row.correct, row.total);
	const tone = accuracyTone(pct);

	if (layout === "stacked") {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="space-y-2">
						<div className="flex items-center justify-between gap-3">
							<span className="flex items-center gap-2 text-sm font-medium">
								<DifficultyMeter level={row.key} />
								{getDifficultyLabel(row.key)}
							</span>
							<span className="text-muted-foreground text-xs tabular-nums">
								{showCounts && `${row.correct}/${row.total} corrette `}
								<span className={cn("text-sm font-semibold", tone.ink)}>{pct}%</span>
							</span>
						</div>
						<div className="bg-muted h-2 overflow-hidden rounded-full">
							<div
								className="h-full rounded-full"
								style={{ width: `${pct}%`, backgroundColor: tone.fill }}
							/>
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent className="tabular-nums">
					{row.correct} risposte corrette su {row.total}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<span className="w-20 shrink-0 text-sm">{getDifficultyLabel(row.key)}</span>
			<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
				<div
					className="h-full rounded-full"
					style={{ width: `${pct}%`, backgroundColor: tone.fill }}
				/>
			</div>
			<span
				className={cn(
					"w-9 shrink-0 text-right text-sm font-semibold tabular-nums",
					tone.ink
				)}
			>
				{pct}%
			</span>
			<span className="text-muted-foreground w-14 shrink-0 text-right text-xs tabular-nums">
				{row.correct}/{row.total}
			</span>
		</div>
	);
}

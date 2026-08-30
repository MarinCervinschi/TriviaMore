import type { ReactNode } from "react";

import { MedalStarIcon } from "@solar-icons/react/linear/medal-star";

import { Badge } from "@/components/ui/badge";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { THIRTY_SCALE_MAX } from "@/lib/quiz/scoring";
import { cn } from "@/lib/utils";
import {
	formatThirtyScaleGrade,
	getGradeChartColor,
	getGradeColor,
} from "@/lib/utils/grading";

export type TrendPoint = { label: string; score: number };

const PLOT = 104;
/** The value label sits above its column and inside the plot, so the bars give it room. */
const BAR_ROOM = PLOT - 20;
/** A grade of 1 is 3px of column: still a bar, but only just. This keeps it a mark. */
const BAR_MIN = 6;

/**
 * The same section, attempt after attempt. Plain divs rather than Recharts: five
 * columns and a mean rule do not need a plotting library, and this way the card
 * renders identically on the server and in a test.
 *
 * The zero baseline stays — a truncated axis would turn two points of progress
 * into a cliff.
 */
export function AttemptTrendCard({
	title,
	points,
	average,
	attemptLabel,
	isPersonalBest,
	action,
	max = THIRTY_SCALE_MAX,
	className,
}: {
	title: string;
	/** Oldest first; the last one is this attempt. */
	points: TrendPoint[];
	average: number;
	/** Where this attempt sits in the run — "5º tentativo su questa sezione." */
	attemptLabel: string;
	isPersonalBest: boolean;
	/** The header's closing control, usually a link to the history. */
	action?: ReactNode;
	max?: number;
	className?: string;
}) {
	const current = points[points.length - 1];

	if (!current) {
		return (
			<InsetCard title={title} actions={action} className={className}>
				<InlineEmpty>Nessun tentativo precedente su questa sezione.</InlineEmpty>
			</InsetCard>
		);
	}

	return (
		<InsetCard title={title} actions={action} className={className}>
			<div className="flex flex-col sm:flex-row sm:items-stretch">
				<div className="border-border/60 shrink-0 border-b p-5 sm:w-60 sm:border-r sm:border-b-0">
					<p className="eyebrow text-muted-foreground">Questo tentativo</p>
					<div className="mt-2.5 flex items-baseline gap-2">
						<span
							className={cn(
								"text-4xl font-bold tabular-nums",
								getGradeColor(current.score)
							)}
						>
							{formatThirtyScaleGrade(current.score)}
						</span>
						<span className="text-muted-foreground text-sm font-medium">/ 30</span>
					</div>
					{isPersonalBest && (
						<Badge
							variant="outline"
							className="border-success/30 bg-success/12 text-success mt-3 gap-1.5"
						>
							<MedalStarIcon className="size-3.5" />
							Nuovo massimo
						</Badge>
					)}
					<p className="text-muted-foreground mt-3 text-xs">{attemptLabel}</p>
				</div>

				<div className="min-w-0 flex-1 space-y-2.5 p-5">
					<div className="relative">
						<div
							aria-hidden
							className="border-muted-foreground/45 absolute inset-x-0 border-t border-dashed"
							style={{ bottom: (average / max) * BAR_ROOM + 22 }}
						/>
						<div className="relative flex items-end gap-1">
							{points.map((point, index) => {
								const last = index === points.length - 1;
								const fill = getGradeChartColor(point.score);
								return (
									<div
										key={`${point.label}-${index}`}
										className="flex min-w-0 flex-1 flex-col items-center gap-2"
									>
										<div
											className="flex w-full flex-col items-center justify-end gap-1"
											style={{ height: PLOT }}
										>
											<span
												className={cn(
													"text-xs tabular-nums",
													last
														? cn("font-bold", getGradeColor(point.score))
														: "text-muted-foreground font-medium"
												)}
											>
												{formatThirtyScaleGrade(point.score)}
											</span>
											<div
												className="w-full max-w-11 rounded-t"
												style={{
													height: Math.max(
														BAR_MIN,
														Math.round((point.score / max) * BAR_ROOM)
													),
													backgroundColor: last
														? fill
														: `color-mix(in srgb, ${fill} 45%, transparent)`,
												}}
											/>
										</div>
										<span className="text-muted-foreground text-2xs truncate">
											{point.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
					<div className="text-muted-foreground text-2xs flex items-center justify-end gap-1.5 tabular-nums">
						<span
							aria-hidden
							className="border-muted-foreground/60 w-4 border-t border-dashed"
						/>
						media dei tuoi tentativi {Math.round(average * 10) / 10}
					</div>
				</div>
			</div>
		</InsetCard>
	);
}

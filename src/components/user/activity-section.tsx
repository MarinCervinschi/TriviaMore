import { useState } from "react";

import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { Link } from "@tanstack/react-router";

import {
	type CalendarDatum,
	CalendarHeatmap,
	type HeatmapView,
	heatmapYears,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import type { RecentQuizAttempt } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import { getScoreBadgeVariant } from "@/lib/utils/quiz-results";

/**
 * The dashboard's activity block: the study-activity heatmap and the most recent
 * quizzes, side by side under one heading. The year filter sits over the heatmap
 * card; "Vedi tutti" leads to the full attempt history.
 */
export function ActivitySection({
	data,
	endDate,
	attempts,
}: {
	data: CalendarDatum[];
	endDate: string;
	attempts: RecentQuizAttempt[];
}) {
	const [view, setView] = useState<HeatmapView>("rolling");
	const years = heatmapYears(data);

	return (
		<div className="space-y-4">
			<div>
				<p className="text-brand eyebrow-lg">La tua attività</p>
				<h2 className="text-xl font-bold">Il tuo percorso</h2>
			</div>

			<div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
				<div className="flex flex-col gap-3">
					<div className="flex h-9 items-center gap-1">
						{years.map(y => (
							<button
								key={y}
								type="button"
								onClick={() => setView(view === y ? "rolling" : y)}
								className={cn(
									"rounded-md px-3 py-1 text-sm transition-colors",
									view === y
										? "bg-primary/10 text-brand font-medium"
										: "text-muted-foreground hover:bg-muted"
								)}
							>
								{y}
							</button>
						))}
					</div>
					<CalendarHeatmap
						data={data}
						endDate={endDate}
						view={view}
						className="flex-1"
						emptyMessage="Completa il tuo primo quiz per iniziare a tracciare la tua attività."
					/>
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-3">
					<div className="flex h-9 items-center justify-between">
						<p className="text-muted-foreground text-sm font-medium">Ultimi quiz</p>
						<Button asChild variant="ghost" size="sm" className="group">
							<Link to="/user/progress/history" className="flex items-center gap-1">
								Vedi tutti
								<ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
							</Link>
						</Button>
					</div>

					<Card className="flex flex-1 flex-col p-4">
						{attempts.length === 0 ? (
							<InlineEmpty>Nessun quiz completato di recente.</InlineEmpty>
						) : (
							<div className="flex flex-1 flex-col justify-between gap-1">
								{attempts.map(attempt => (
									<Link
										key={attempt.id}
										to="/quiz/results/$attemptId"
										params={{ attemptId: attempt.id }}
										className="hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors"
									>
										<div className="bg-primary/10 shrink-0 rounded-lg p-2">
											<CupFirstIcon className="text-brand h-4 w-4" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{attempt.sectionName}
											</p>
											<p className="text-muted-foreground truncate text-xs">
												{[attempt.departmentCode, attempt.courseCode]
													.filter(Boolean)
													.join(" · ") || attempt.className}
											</p>
										</div>
										<div className="shrink-0 text-right">
											<Badge variant={getScoreBadgeVariant(attempt.score)}>
												{attempt.score}/33
											</Badge>
											<p className="text-muted-foreground text-2xs mt-0.5">
												{formatDate(attempt.completedAt)}
											</p>
										</div>
									</Link>
								))}
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}

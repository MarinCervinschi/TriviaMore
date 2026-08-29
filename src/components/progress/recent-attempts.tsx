import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { Link } from "@tanstack/react-router";

import { ChartCard } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { sectionDisplayName } from "@/lib/catalog/constants";
import type { AttemptHistoryEntry } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import { formatGradeOutOf33, getGradeColor } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

/**
 * The last few sittings, as a list rather than a table: there is nothing to sort
 * or filter here, and the full table already lives at the history page. A row
 * carries where the quiz was, when, in which mode, and how it went.
 */
export function RecentAttempts({
	attempts,
	limit = 5,
}: {
	attempts: AttemptHistoryEntry[];
	limit?: number;
}) {
	const recent = attempts.slice(0, limit);

	return (
		<ChartCard
			title="Ultimi tentativi"
			description={`${attempts.length} quiz completati in tutto`}
			actions={
				<Button asChild variant="ghost" size="sm" className="group">
					<Link to="/user/analytics/history" className="flex items-center gap-1">
						Cronologia completa
						<ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
					</Link>
				</Button>
			}
		>
			{recent.length === 0 ? (
				<InlineEmpty>Nessun quiz completato di recente.</InlineEmpty>
			) : (
				<ul className="divide-border/60 divide-y">
					{recent.map(attempt => (
						<li
							key={attempt.id}
							className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">
									{attempt.sectionName
										? sectionDisplayName(attempt.sectionName)
										: "Sezione eliminata"}
								</p>
								<p className="text-muted-foreground truncate text-xs">
									{[
										formatDate(attempt.completedAt),
										attempt.className,
										attempt.courseCode,
									]
										.filter(Boolean)
										.join(" · ")}
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-3">
								{attempt.quizMode && (
									<Badge variant="secondary" className="hidden sm:inline-flex">
										{attempt.quizMode === "STUDY" ? "Studio" : "Esame"}
									</Badge>
								)}
								{attempt.timeSpent != null && (
									<span className="text-muted-foreground hidden w-16 text-right text-xs tabular-nums sm:block">
										{formatTimeSpent(attempt.timeSpent)}
									</span>
								)}
								<span
									className={cn(
										"w-16 text-right text-sm font-semibold tabular-nums",
										getGradeColor(attempt.score)
									)}
								>
									{formatGradeOutOf33(attempt.score)}
								</span>
							</div>
						</li>
					))}
				</ul>
			)}
		</ChartCard>
	);
}

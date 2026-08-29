import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { Link } from "@tanstack/react-router";

import { ChartCard } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import { sectionDisplayName } from "@/lib/catalog/constants";
import type { QuizMode } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

import { FavoriteStar } from "./favorite-star";
import { ScoreRing } from "./score-ring";

/**
 * The little a row needs, so both the full history entry and the dashboard's
 * lighter recent attempt fit without either being widened.
 */
export type RecentAttemptRow = {
	id: string;
	score: number;
	completedAt: string;
	sectionName: string | null;
	isFavorite?: boolean;
	quizId?: string | null;
	className?: string | null;
	courseCode?: string | null;
	departmentCode?: string | null;
	quizMode?: QuizMode | null;
	timeSpent?: number | null;
};

/**
 * The last few sittings, as a list rather than a table: there is nothing to sort
 * or filter here, and the full table already lives at the history page. The grade
 * is said once, by the ring — a column of rings reads before any figure does.
 */
export function RecentAttempts({
	attempts,
	limit = 5,
	total,
}: {
	attempts: RecentAttemptRow[];
	limit?: number;
	/** The whole count, when the list is only a window onto it. */
	total?: number;
}) {
	const recent = attempts.slice(0, limit);
	const count = total ?? attempts.length;

	return (
		<TooltipProvider delayDuration={200}>
			<ChartCard
				title="Ultimi tentativi"
				description={`${count} quiz completati in tutto`}
				actions={
					<Button asChild variant="ghost" size="sm" className="group">
						<Link to="/user/analytics/history" className="flex items-center gap-1.5">
							<ClockCircleIcon className="size-3.5" />
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
						{recent.map(attempt => {
							// The codes place the quiz, the class names it: there is room for both.
							const place = [
								attempt.departmentCode,
								attempt.courseCode,
								attempt.className,
							]
								.filter(Boolean)
								.join(" · ");
							return (
								<li
									key={attempt.id}
									className="group/row flex items-center gap-3 py-3 first:pt-0 last:pb-0"
								>
									<ScoreRing score={attempt.score} />

									<div className="min-w-0 flex-1">
										<Body
											name={
												attempt.sectionName
													? sectionDisplayName(attempt.sectionName)
													: "Sezione eliminata"
											}
											place={place}
											attemptId={attempt.quizId ? attempt.id : null}
										/>
									</div>

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

									<span className="text-muted-foreground w-24 text-right text-xs tabular-nums">
										{formatDate(attempt.completedAt)}
									</span>

									<FavoriteStar
										attemptId={attempt.id}
										isFavorite={attempt.isFavorite ?? false}
									/>
								</li>
							);
						})}
					</ul>
				)}
			</ChartCard>
		</TooltipProvider>
	);
}

/** The two lines of a row, linked to the result when the quiz still exists. */
function Body({
	name,
	place,
	attemptId,
}: {
	name: string;
	place: string;
	attemptId: string | null;
}) {
	const body = (
		<>
			<p
				className={cn(
					"truncate text-sm font-medium",
					attemptId && "group-hover/row:text-brand transition-colors"
				)}
			>
				{name}
			</p>
			{place && <p className="text-muted-foreground truncate text-xs">{place}</p>}
		</>
	);

	return attemptId ? (
		<Link to="/quiz/results/$attemptId" params={{ attemptId }} className="block">
			{body}
		</Link>
	) : (
		body
	);
}

import { useMemo } from "react";

import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { Link } from "@tanstack/react-router";

import { FavoriteStar } from "@/components/progress/favorite-star";
import { BookmarkButton } from "@/components/quiz/bookmark-button";
import { ReportButton } from "@/components/requests/report-button";
import { Button } from "@/components/ui/button";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";
import { classBrowsePath } from "@/lib/catalog/paths";
import { summariseAttempt } from "@/lib/quiz/results";
import { THIRTY_SCALE_MAX } from "@/lib/quiz/scoring";
import type { QuizAttemptResult } from "@/lib/quiz/types";
import { formatDayMonth } from "@/lib/utils/format";

import { AttemptTrendCard } from "./attempt-trend-card";
import { DifficultyAccuracyCard } from "./difficulty-accuracy-card";
import { PaceCard, type PaceReference } from "./pace-card";
import { ResultsHero } from "./results-hero";
import { ReviewItem } from "./review-item";
import { ReviewList } from "./review-list";
import { ScoreLedgerCard } from "./score-ledger-card";

const ACTION_CLASS = "border-border/60 bg-card size-8 rounded-lg border";

/**
 * The results page itself, without the data loading — so the layout that ships is
 * the one the story renders.
 *
 * The two shapes it takes come from the evaluation mode, not from the quiz mode:
 * a run that can lose points gets the ledger that says where they went, and one
 * that cannot has no use for it.
 */
export function QuizResultsView({ result }: { result: QuizAttemptResult }) {
	const summary = useMemo(() => summariseAttempt(result), [result]);
	const { section, timeLimit } = result.quiz;
	const history = result.history;

	// The exam sentinel is a stable id, not a place: an exam simulation belongs to
	// its class, and that is where both its history and its "go back" point.
	const sentinel = section.name === EXAM_SIMULATION_SECTION;
	const backPath = sentinel ? classBrowsePath(section) : section.path;
	const backLabel = sentinel ? "Torna all'insegnamento" : "Torna alla sezione";

	const reference: PaceReference | undefined = timeLimit
		? { kind: "limit", ms: timeLimit * 60_000 }
		: history?.avgSecondsPerQuestion != null
			? { kind: "average", seconds: history.avgSecondsPerQuestion }
			: undefined;

	const pace = (
		<PaceCard
			totalMs={result.timeSpent}
			questions={summary.total}
			reference={reference}
		/>
	);

	const difficulty = <DifficultyAccuracyCard byDifficulty={summary.byDifficulty} />;

	return (
		<div className="container py-8">
			<div className="mx-auto max-w-4xl space-y-6">
				<ResultsHero
					result={result}
					summary={summary}
					favorite={
						<FavoriteStar
							attemptId={result.id}
							isFavorite={result.isFavorite}
							className="size-10"
						/>
					}
				/>

				{summary.hasPenalty ? (
					<>
						{pace}
						<div className="grid gap-6 sm:grid-cols-2">
							<ScoreLedgerCard
								correct={summary.correct + summary.partial}
								wrong={summary.wrong}
								unanswered={summary.unanswered}
								earned={summary.earned}
								lost={summary.lost}
								net={result.score}
								max={THIRTY_SCALE_MAX}
							/>
							{difficulty}
						</div>
					</>
				) : (
					<div className="grid gap-6 sm:grid-cols-2">
						{pace}
						{difficulty}
					</div>
				)}

				{history && history.points.length > 1 && (
					<AttemptTrendCard
						title={`Andamento su ${sentinel ? section.className : section.name}`}
						points={history.points.map(point => ({
							label: formatDayMonth(point.completedAt, result.completedAt),
							score: point.score,
						}))}
						average={history.average}
						attemptLabel={`${history.position}º tentativo ${sentinel ? "in simulazione d\u0027esame" : "su questa sezione"}.`}
						isPersonalBest={history.isPersonalBest}
						action={
							<Link
								to={
									sentinel ? "/user/analytics/class/$id" : "/user/analytics/section/$id"
								}
								params={{ id: sentinel ? section.classId : section.id }}
								className="group text-foreground inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
							>
								<GraphUpIcon className="size-3.5" />
								Vedi lo storico
								<AltArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
							</Link>
						}
					/>
				)}

				<ReviewList
					rows={summary.rows}
					renderItem={(row, index, open) => (
						<ReviewItem
							key={row.question.id}
							index={index}
							question={row.question}
							userAnswer={row.userAnswer}
							verdict={row.verdict}
							scaledScore={row.scaledScore}
							defaultOpen={open}
							actions={
								<>
									<BookmarkButton
										questionId={row.question.id}
										className={ACTION_CLASS}
									/>
									<ReportButton
										questionId={row.question.id}
										questionContent={row.question.content}
										className={ACTION_CLASS}
									/>
								</>
							}
						/>
					)}
				/>

				<div className="flex flex-wrap justify-center gap-3 pt-2 pb-8">
					<Button variant="outline" size="lg" asChild>
						<Link to="/user/analytics">
							<GraphUpIcon />I tuoi progressi
						</Link>
					</Button>
					{backPath && (
						<Button size="lg" asChild>
							<Link to={backPath}>
								<AltArrowLeftIcon />
								{backLabel}
							</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

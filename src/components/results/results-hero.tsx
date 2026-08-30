import type { ReactNode } from "react";

import { BookMinimalisticIcon } from "@solar-icons/react/linear/book-minimalistic";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClipboardCheckIcon } from "@solar-icons/react/linear/clipboard-check";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { MinusCircleIcon } from "@solar-icons/react/linear/minus-circle";
import { RecordCircleIcon } from "@solar-icons/react/linear/record-circle";

import { Figure, FigureRow } from "@/components/shared/figure-row";
import { Badge } from "@/components/ui/badge";
import { InsetCard } from "@/components/ui/inset-card";
import type { AttemptSummary } from "@/lib/quiz/results";
import {
	THIRTY_SCALE_MAX,
	formatScaledScore,
	formatScaledSigned,
} from "@/lib/quiz/scoring";
import type { QuizAttemptResult } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";
import { formatThirtyScaleGrade, getGradeColor, gradeBand } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

import { GradeBandScale } from "./grade-band-scale";

function Bullet() {
	return <span className="bg-muted-foreground/30 size-1 rounded-full" aria-hidden />;
}

/**
 * The verdict, before any of the detail: the grade, where it falls on the five
 * bands, what the evaluation mode paid for each answer, and the counts.
 *
 * Blank answers get their own figure rather than being folded into the wrong
 * ones. Under a penalty they are not the same event — one costs points and the
 * other does not — and a student who left three questions has to see that.
 */
export function ResultsHero({
	result,
	summary,
	favorite,
}: {
	result: QuizAttemptResult;
	summary: AttemptSummary;
	favorite?: ReactNode;
}) {
	const { quizMode, timeLimit, evaluationMode } = result.quiz;
	const exam = quizMode === "EXAM_SIMULATION";
	const ModeIcon = exam ? ClipboardCheckIcon : BookMinimalisticIcon;
	// `quizzes.time_limit` is stored in minutes, the same unit the timer counts down from.
	const minutes = timeLimit;
	const showPartial = evaluationMode.partialCreditEnabled || summary.partial > 0;

	const figures = [
		<Figure
			key="correct"
			icon={CheckCircleIcon}
			value={summary.correct}
			label="Corrette"
			tone="text-success"
		/>,
		showPartial ? (
			<Figure
				key="partial"
				icon={RecordCircleIcon}
				value={summary.partial}
				label="Parziali"
				tone="text-warning"
			/>
		) : null,
		<Figure
			key="wrong"
			icon={CloseCircleIcon}
			value={summary.wrong}
			label="Errate"
			tone="text-danger"
		/>,
		<Figure
			key="unanswered"
			icon={MinusCircleIcon}
			value={summary.unanswered}
			label="Non risposte"
		/>,
		<Figure
			key="time"
			icon={ClockCircleIcon}
			value={result.timeSpent != null ? formatTimeSpent(result.timeSpent) : "—"}
			label={minutes ? `Tempo su ${minutes}m` : "Tempo"}
			tone="text-info"
		/>,
	].filter(Boolean);

	return (
		<InsetCard
			title="Esito della prova"
			actions={favorite}
			texture="top"
			textureAlpha={0.2}
		>
			<div className="relative flex flex-col sm:flex-row sm:items-stretch">
				<div className="min-w-0 flex-1 p-6 sm:p-7">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="gap-1.5">
							<ModeIcon className="text-muted-foreground size-3.5" />
							{exam ? "Simulazione d'esame" : "Studio"}
						</Badge>
						<Badge variant="outline" className="text-muted-foreground">
							{summary.total} domande
							{minutes ? ` in ${minutes} minuti` : ""}
						</Badge>
					</div>
					<div className="mt-5 flex items-baseline gap-2.5">
						<span
							className={cn(
								"text-6xl font-bold tracking-tight tabular-nums",
								getGradeColor(result.score)
							)}
						>
							{formatThirtyScaleGrade(result.score)}
						</span>
						<span className="text-muted-foreground text-xl font-medium">/ 30</span>
					</div>
					<p className="text-muted-foreground mt-3 text-lg">
						{gradeBand(result.score).name}
					</p>
				</div>
				<div className="border-border/60 flex flex-col justify-center border-t p-6 sm:w-80 sm:border-t-0 sm:border-l sm:p-7">
					<p className="eyebrow text-muted-foreground mb-3.5">Sulla scala</p>
					<GradeBandScale score={result.score} />
				</div>
			</div>

			<div className="text-muted-foreground relative flex flex-wrap items-center gap-3 border-t px-6 py-3.5 text-sm sm:px-7">
				<span>
					Valutazione{" "}
					<span className="text-foreground font-medium">{evaluationMode.name}</span>
				</span>
				<Bullet />
				<span>
					Corretta{" "}
					<span className="text-success font-semibold tabular-nums">
						+{formatScaledScore(summary.perQuestionMax)} pt
					</span>
				</span>
				{summary.hasPenalty && (
					<>
						<Bullet />
						<span>
							Errata{" "}
							<span className="text-danger font-semibold tabular-nums">
								{formatScaledSigned(summary.perQuestionMin)} pt
							</span>
						</span>
					</>
				)}
				<Bullet />
				<span>
					Punteggio{" "}
					<span className="text-foreground font-medium tabular-nums">
						{formatScaledScore(result.score)} / {THIRTY_SCALE_MAX}
					</span>
				</span>
			</div>

			<FigureRow
				className={cn(
					"relative grid-cols-2",
					figures.length === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4"
				)}
			>
				{figures}
			</FigureRow>
		</InsetCard>
	);
}

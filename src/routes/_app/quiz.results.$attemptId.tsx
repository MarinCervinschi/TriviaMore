import { useState } from "react";

import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { LightbulbMinimalisticIcon } from "@solar-icons/react/linear/lightbulb-minimalistic";
import { RecordCircleIcon } from "@solar-icons/react/linear/record-circle";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { NotFoundPage } from "@/components/error/not-found-page";
import { BookmarkButton } from "@/components/quiz/bookmark-button";
import { ReportButton } from "@/components/requests/report-button";
import { QuizResultsSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { isCorrectOption, parseOptions } from "@/lib/quiz/options";
import { quizQueries } from "@/lib/quiz/queries";
import {
	formatScaledScore,
	formatScaledSigned,
	getNormalizedEvaluationScale,
	scaleAnswerScore,
} from "@/lib/quiz/scoring";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
	formatThirtyScaleGrade,
	getGradeColor,
	getGradeDescription,
} from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

export const Route = createFileRoute("/_app/quiz/results/$attemptId")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData(
			quizQueries.results(params.attemptId)
		);
		if (!data) throw notFound();
		return data;
	},
	head: () => seoHead({ title: "Risultati quiz", noindex: true }),
	pendingComponent: QuizResultsSkeleton,
	component: ResultsPage,
	notFoundComponent: () => (
		<NotFoundPage message="Il risultato del quiz non è stato trovato." />
	),
});

function ResultsPage() {
	const { attemptId } = Route.useParams();
	const { data: result } = useSuspenseQuery(quizQueries.results(attemptId));

	if (!result) return null;

	const evalMode = result.quiz.evaluationMode;
	const totalQuestions = result.quiz.questions.length;
	const { perQuestionMax, perQuestionMin, hasPenalty } = getNormalizedEvaluationScale(
		evalMode,
		totalQuestions
	);

	const counts = result.answers.reduce(
		(acc, a) => {
			const q = result.quiz.questions.find(q => q.id === a.questionId);
			if (!q) return acc;
			const userSet = new Set(a.userAnswer);
			const correctSet = new Set(q.correctAnswer);
			const isExact =
				userSet.size === correctSet.size && [...userSet].every(v => correctSet.has(v));
			if (isExact) acc.correct++;
			else if ((a.score ?? 0) > 0) acc.partial++;
			return acc;
		},
		{ correct: 0, partial: 0 }
	);
	const correctCount = counts.correct;
	const partialCount = counts.partial;
	const wrongCount = result.quiz.questions.length - correctCount - partialCount;

	return (
		<div className="container py-8">
			<div className="mx-auto max-w-4xl space-y-8">
				{/* Score Hero */}
				<div className="bg-card relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12">
					<div className="bg-primary/10 pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full blur-[60px]" />
					<div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-orange-300/10 blur-[60px]" />

					<p className="text-muted-foreground relative mb-1 text-sm">
						{result.quiz.section.name} &bull; {result.quiz.section.courseName}
					</p>
					<p
						className={cn(
							"relative text-6xl font-bold sm:text-7xl",
							getGradeColor(result.score)
						)}
					>
						{formatThirtyScaleGrade(result.score)}
					</p>
					<p className="text-muted-foreground relative mt-2 text-lg">
						{getGradeDescription(result.score)}
					</p>

					<div className="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
						<div className="bg-muted/50 rounded-2xl p-4">
							<CheckCircleIcon className="mx-auto mb-2 h-5 w-5 text-green-500" />
							<p className="text-2xl font-bold">{correctCount}</p>
							<p className="text-muted-foreground text-xs">Corrette</p>
						</div>
						<div className="bg-muted/50 rounded-2xl p-4">
							<RecordCircleIcon className="mx-auto mb-2 h-5 w-5 text-yellow-500" />
							<p className="text-2xl font-bold">{partialCount}</p>
							<p className="text-muted-foreground text-xs">Parziali</p>
						</div>
						<div className="bg-muted/50 rounded-2xl p-4">
							<CloseCircleIcon className="mx-auto mb-2 h-5 w-5 text-red-500" />
							<p className="text-2xl font-bold">{wrongCount}</p>
							<p className="text-muted-foreground text-xs">Errate</p>
						</div>
						<div className="bg-muted/50 rounded-2xl p-4">
							<ClockCircleIcon className="mx-auto mb-2 h-5 w-5 text-blue-500" />
							<p className="text-2xl font-bold">
								{result.timeSpent ? formatTimeSpent(result.timeSpent) : "N/A"}
							</p>
							<p className="text-muted-foreground text-xs">Tempo</p>
						</div>
					</div>

					{/* Evaluation inline */}
					<div className="text-muted-foreground relative mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
						<span>{evalMode.name}</span>
						<span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
						<span>
							Corretta:{" "}
							<span className="font-medium text-green-600">
								+{formatScaledScore(perQuestionMax)} pt
							</span>
						</span>
						{hasPenalty && (
							<>
								<span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
								<span>
									Errata:{" "}
									<span className="font-medium text-red-600">
										{formatScaledSigned(perQuestionMin)} pt
									</span>
								</span>
							</>
						)}
					</div>
				</div>

				{/* Question Review */}
				<div>
					<h2 className="mb-4 text-xl font-bold tracking-tight">Revisione domande</h2>
					<div className="space-y-3">
						{result.quiz.questions.map((question, index) => {
							const answer = result.answers.find(a => a.questionId === question.id);
							const userAnswers = answer?.userAnswer ?? [];
							const userAnswerSet = new Set(userAnswers);
							const correctAnswerSet = new Set(question.correctAnswer);
							const isCorrect =
								userAnswerSet.size === correctAnswerSet.size &&
								[...userAnswerSet].every(v => correctAnswerSet.has(v));

							return (
								<ReviewItem
									key={question.id}
									question={question}
									userAnswerSet={userAnswerSet}
									isCorrect={isCorrect}
									score={answer?.score ?? 0}
									scaledScore={scaleAnswerScore(
										answer?.score ?? 0,
										evalMode,
										totalQuestions
									)}
									index={index}
								/>
							);
						})}
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-wrap justify-center gap-3 pb-8">
					<Button variant="outline" size="lg" asChild>
						<Link to="/">Torna alla home</Link>
					</Button>
					{result.quiz.section.path && (
						<Button size="lg" asChild>
							<Link to={result.quiz.section.path}>Torna alla sezione</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function ReviewItem({
	question,
	userAnswerSet,
	isCorrect,
	score,
	scaledScore,
	index,
}: {
	question: {
		id: string;
		content: string;
		options: string[] | null;
		correctAnswer: string[];
		explanation: string | null;
	};
	userAnswerSet: Set<string>;
	isCorrect: boolean;
	score: number;
	scaledScore: number;
	index: number;
}) {
	const [open, setOpen] = useState(false);
	const options = parseOptions(question.options);

	return (
		<div className="bg-card overflow-hidden rounded-2xl border">
			<div
				role="button"
				tabIndex={0}
				onClick={() => setOpen(!open)}
				onKeyDown={e => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setOpen(!open);
					}
				}}
				className="hover:bg-muted/30 flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors"
			>
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<span className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
						{index + 1}
					</span>
					<span
						className={`min-w-0 flex-1 text-sm font-medium ${open ? "" : "line-clamp-1"}`}
					>
						<MarkdownRenderer content={question.content} inline />
					</span>
				</div>
				<ResultBadge
					isCorrect={isCorrect}
					score={score}
					scaledScore={scaledScore}
					hasAnswer={userAnswerSet.size > 0}
				/>
			</div>

			{open && (
				<div className="space-y-3 border-t px-4 pt-3 pb-4">
					<div
						className="flex items-center justify-end gap-1"
						onClick={e => e.stopPropagation()}
					>
						<BookmarkButton questionId={question.id} />
						<ReportButton questionId={question.id} questionContent={question.content} />
					</div>
					{options.length > 0 && (
						<ul className="space-y-1.5">
							{options.map((option, optIndex) => {
								const isOptionCorrect = isCorrectOption(
									option.id,
									question.correctAnswer
								);
								const isSelected = userAnswerSet.has(option.id);

								let bgClass = "bg-muted/30";
								if (isOptionCorrect && isSelected)
									bgClass = "bg-green-500/10 text-green-700 dark:text-green-400";
								else if (isOptionCorrect && !isSelected)
									bgClass = "bg-blue-500/10 text-blue-700 dark:text-blue-400";
								else if (!isOptionCorrect && isSelected)
									bgClass = "bg-red-500/10 text-red-700 dark:text-red-400";

								return (
									<li key={option.id} className={`rounded-xl p-3 text-sm ${bgClass}`}>
										<span className="mr-2 font-semibold">
											{String.fromCharCode(65 + optIndex)})
										</span>
										<MarkdownRenderer content={option.text} inline />
										{isOptionCorrect && (
											<span className="ml-2 text-xs font-medium">
												&#10003; Corretta
											</span>
										)}
										{!isOptionCorrect && isSelected && (
											<span className="ml-2 text-xs font-medium">
												&#10007; Selezionata
											</span>
										)}
									</li>
								);
							})}
						</ul>
					)}
					{question.explanation && (
						<div className="border-primary bg-muted/40 rounded-xl border-l-4 p-4">
							<div className="text-brand eyebrow mb-1 flex items-center gap-1.5">
								<LightbulbMinimalisticIcon className="h-3.5 w-3.5" />
								Spiegazione
							</div>
							<div className="text-foreground/90 text-sm">
								<MarkdownRenderer
									content={question.explanation}
									className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
								/>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function ResultBadge({
	isCorrect,
	score,
	scaledScore,
	hasAnswer,
}: {
	isCorrect: boolean;
	score: number;
	scaledScore: number;
	hasAnswer: boolean;
}) {
	const { label, classes } = (() => {
		if (isCorrect)
			return {
				label: "Corretta",
				classes:
					"bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400",
			};
		if (score > 0)
			return {
				label: "Parziale",
				classes:
					"bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
			};
		if (hasAnswer)
			return {
				label: "Errata",
				classes: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
			};
		return {
			label: "Non risposta",
			classes: "bg-muted text-muted-foreground border-border",
		};
	})();

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold tabular-nums",
				classes
			)}
		>
			{label} ({formatScaledSigned(scaledScore)} pt)
		</span>
	);
}

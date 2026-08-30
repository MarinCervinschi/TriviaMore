import { useMemo, useState } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { EyeIcon } from "@solar-icons/react/linear/eye";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { MinusCircleIcon } from "@solar-icons/react/linear/minus-circle";
import { RefreshIcon } from "@solar-icons/react/linear/refresh";
import { StopwatchIcon } from "@solar-icons/react/linear/stopwatch";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DeckCoverage } from "@/components/results/deck-coverage";
import { Figure, FigureRow } from "@/components/shared/figure-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { Logo } from "@/components/ui/logo";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { FlashcardQuestion } from "@/lib/flashcard/types";
import { formatSeconds, formatTimeSpent } from "@/lib/utils/quiz-results";

type Filter = "unseen" | "all" | "studied";

function completionMessage(percentage: number): string {
	if (percentage === 100) return "Hai girato tutte le carte.";
	if (percentage >= 80) return "Ottimo lavoro!";
	if (percentage >= 60) return "Buon progresso!";
	if (percentage >= 40) return "Continua a studiare!";
	return "Hai ancora molto da ripassare.";
}

function CardRow({
	index,
	content,
	studied,
}: {
	index: number;
	content: string;
	studied: boolean;
}) {
	return (
		<div className="bg-card border-border/50 flex items-center gap-3 rounded-2xl border p-3.5 shadow-xs">
			<span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums">
				{index + 1}
			</span>
			<span className="min-w-0 flex-1 truncate text-sm font-medium">
				<MarkdownRenderer content={content} inline />
			</span>
			{studied ? (
				<Badge
					variant="outline"
					className="border-success/30 bg-success/12 text-success shrink-0"
				>
					Studiata
				</Badge>
			) : (
				<Badge variant="outline" className="text-muted-foreground shrink-0">
					Non vista
				</Badge>
			)}
		</div>
	);
}

/**
 * The end of a flashcard session. There is no grade to report — nothing was
 * answered — so coverage is the headline: how much of the deck was actually
 * turned over, and which cards were not.
 */
export function FlashcardResults({
	questions,
	studiedCards,
	timeSpent,
	sectionName,
	onExit,
	onRetry,
}: {
	questions: FlashcardQuestion[];
	studiedCards: Set<number>;
	/** The whole session, in milliseconds. */
	timeSpent: number;
	sectionName: string;
	onExit: () => void;
	onRetry?: () => void;
}) {
	const total = questions.length;
	const studied = studiedCards.size;
	const percentage = total === 0 ? 0 : Math.round((studied / total) * 100);
	const perCard = studied === 0 ? null : Math.round(timeSpent / 1000 / studied);

	const [filter, setFilter] = useState<Filter>(studied < total ? "unseen" : "all");

	const shown = useMemo(() => {
		const numbered = questions.map((question, index) => ({ question, index }));
		if (filter === "all") return numbered;
		const wanted = filter === "studied";
		return numbered.filter(entry => studiedCards.has(entry.index) === wanted);
	}, [questions, studiedCards, filter]);

	return (
		<div className="bg-background min-h-screen">
			<header className="border-border/50 bg-background flex items-center justify-between border-b px-4 py-3">
				<Logo size="sm" />
				<ThemeToggle className="h-9 w-9" />
			</header>

			<div className="mx-auto max-w-4xl space-y-6 p-6">
				<InsetCard title="Sessione completata" texture="top" textureAlpha={0.2}>
					<div className="relative flex flex-col sm:flex-row sm:items-stretch">
						<div className="min-w-0 flex-1 p-6 sm:p-7">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="secondary" className="gap-1.5">
									<LayersIcon className="text-muted-foreground size-3.5" />
									Flashcard
								</Badge>
								<Badge variant="outline" className="text-muted-foreground">
									{sectionName}
								</Badge>
							</div>
							<p className="text-success mt-5 text-6xl font-bold tracking-tight tabular-nums">
								{percentage}%
							</p>
							<p className="text-muted-foreground mt-3 text-lg">
								{completionMessage(percentage)}
							</p>
						</div>
						<div className="border-border/60 flex flex-col justify-center border-t p-6 sm:w-80 sm:border-t-0 sm:border-l sm:p-7">
							<p className="eyebrow text-muted-foreground mb-3.5">
								Copertura del mazzo
							</p>
							<DeckCoverage total={total} studied={studied} />
						</div>
					</div>

					<FigureRow className="relative grid-cols-2 sm:grid-cols-4">
						<Figure
							icon={EyeIcon}
							value={`${studied}/${total}`}
							label="Studiate"
							tone="text-success"
						/>
						<Figure icon={MinusCircleIcon} value={total - studied} label="Non viste" />
						<Figure
							icon={ClockCircleIcon}
							value={formatTimeSpent(timeSpent)}
							label="Tempo"
							tone="text-info"
						/>
						<Figure
							icon={StopwatchIcon}
							value={perCard != null ? formatSeconds(perCard) : "—"}
							label="Media per carta"
						/>
					</FigureRow>
				</InsetCard>

				<section className="space-y-3.5">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<h2 className="text-xl font-bold tracking-tight">Riepilogo carte</h2>
						<SegmentedControl
							label="Filtra le carte"
							value={filter}
							onChange={setFilter}
							options={[
								{ value: "unseen", label: "Non viste", count: total - studied },
								{ value: "all", label: "Tutte", count: total },
								{ value: "studied", label: "Studiate", count: studied },
							]}
						/>
					</div>

					{shown.length === 0 ? (
						<InlineEmpty>Nessuna carta in questo filtro.</InlineEmpty>
					) : (
						<div className="space-y-3">
							{shown.map(entry => (
								<CardRow
									key={`${entry.question.id}-${entry.index}`}
									index={entry.index}
									content={entry.question.content}
									studied={studiedCards.has(entry.index)}
								/>
							))}
						</div>
					)}
				</section>

				<div className="flex flex-wrap justify-center gap-3 pt-2 pb-8">
					<Button variant="outline" size="lg" onClick={onExit}>
						Torna alla home
					</Button>
					{onRetry && (
						<Button size="lg" onClick={onRetry}>
							<RefreshIcon />
							Ricomincia
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

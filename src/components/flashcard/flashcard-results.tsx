import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { EyeIcon } from "@solar-icons/react/linear/eye";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Figure, FigureRow } from "@/components/shared/figure-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InsetCard } from "@/components/ui/inset-card";
import { Logo } from "@/components/ui/logo";
import type { FlashcardQuestion } from "@/lib/flashcard/types";

function formatTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes === 0) return `${seconds}s`;
	return `${minutes}m ${seconds}s`;
}

function getCompletionMessage(percentage: number): string {
	if (percentage === 100) return "Hai studiato tutte le carte!";
	if (percentage >= 80) return "Ottimo lavoro!";
	if (percentage >= 60) return "Buon progresso!";
	if (percentage >= 40) return "Continua a studiare!";
	return "Hai ancora molto da ripassare.";
}

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
	timeSpent: number;
	sectionName: string;
	onExit: () => void;
	onRetry?: () => void;
}) {
	const studiedCount = studiedCards.size;
	const totalCards = questions.length;
	const percentage = Math.round((studiedCount / totalCards) * 100);

	return (
		<div className="bg-background min-h-screen">
			<ResultsHeader />
			<div className="mx-auto max-w-4xl space-y-8 p-6">
				{/* Score Hero */}
				<InsetCard texture="top" textureAlpha={0.2}>
					<div className="relative p-8 text-center sm:p-12">
						<p className="text-muted-foreground mb-2 text-sm font-medium">
							{sectionName}
						</p>
						<p className="text-success text-6xl font-bold sm:text-7xl">{percentage}%</p>
						<p className="text-muted-foreground mt-2 text-lg">
							{getCompletionMessage(percentage)}
						</p>
					</div>

					<FigureRow className="relative grid-cols-1 sm:grid-cols-3">
						<Figure
							icon={EyeIcon}
							value={`${studiedCount}/${totalCards}`}
							label="Studiate"
							tone="text-success"
						/>
						<Figure
							icon={CheckCircleIcon}
							value={`${percentage}%`}
							label="Completamento"
							tone="text-brand"
						/>
						<Figure
							icon={ClockCircleIcon}
							value={formatTime(timeSpent)}
							label="Tempo"
							tone="text-info"
						/>
					</FigureRow>
				</InsetCard>

				{/* Card Review */}
				<div>
					<h2 className="mb-4 text-xl font-bold tracking-tight">Riepilogo carte</h2>
					<div className="space-y-3">
						{questions.map((question, index) => {
							const wasStudied = studiedCards.has(index);
							return (
								<Card key={`${question.id}-${index}`} className="overflow-hidden p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
												{index + 1}
											</span>
											<span className="line-clamp-1 text-sm font-medium">
												{question.content.slice(0, 80)}
												{question.content.length > 80 && "..."}
											</span>
										</div>
										<Badge
											variant={wasStudied ? "default" : "secondary"}
											className={
												wasStudied
													? "border-green-500/20 bg-green-500/10 text-green-600"
													: ""
											}
										>
											{wasStudied ? "Studiata" : "Non vista"}
										</Badge>
									</div>
								</Card>
							);
						})}
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-center gap-4 pb-8">
					<Button variant="outline" size="lg" onClick={onExit}>
						Torna alla home
					</Button>
					{onRetry && (
						<Button size="lg" onClick={onRetry}>
							Ricomincia
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function ResultsHeader() {
	return (
		<header className="border-border/50 bg-background flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl">
			<Logo size="sm" />
			<ThemeToggle className="h-9 w-9" />
		</header>
	);
}

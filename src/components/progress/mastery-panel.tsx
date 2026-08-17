import { Link } from "@tanstack/react-router";

import { RadialGauge } from "@/components/charts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTexture,
	CardTitle,
} from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import type { MasteryBreakdown, SectionAccuracy, UserMastery } from "@/lib/user/types";
import { getDifficultyLabel } from "@/lib/user/utils";
import { cn } from "@/lib/utils";

// Fill via the chart status colours (same source as the grade chart marks), ink
// via the status text tokens — the surface/ink split the design system requires.
function accuracyTone(pct: number) {
	if (pct >= 75) return { fill: "var(--color-success)", ink: "text-success" };
	if (pct >= 50) return { fill: "var(--color-warning)", ink: "text-warning" };
	return { fill: "var(--color-destructive)", ink: "text-danger" };
}

function pctOf(correct: number, total: number) {
	return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function GaugeTile({
	value,
	caption,
	sub,
}: {
	value: number;
	caption: string;
	sub: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1">
			<RadialGauge
				value={value}
				label={`${value}%`}
				caption={caption}
				color={accuracyTone(value).fill}
				size={104}
			/>
			<span className="text-muted-foreground text-xs tabular-nums">{sub}</span>
		</div>
	);
}

// One gauge for overall accuracy and one per difficulty, in a single row.
function AccuracyCard({ byDifficulty }: { byDifficulty: MasteryBreakdown[] }) {
	const total = byDifficulty.reduce((sum, row) => sum + row.total, 0);
	const correct = byDifficulty.reduce((sum, row) => sum + row.correct, 0);

	return (
		<Card className="relative overflow-hidden">
			<CardTexture placement="top" />
			<CardHeader className="relative pb-2">
				<CardTitle className="text-base">Accuratezza</CardTitle>
			</CardHeader>
			<CardContent className="relative pb-6">
				<div className="flex flex-wrap items-start justify-around gap-4">
					<GaugeTile
						value={pctOf(correct, total)}
						caption="Generale"
						sub={`${correct}/${total}`}
					/>
					{byDifficulty.map(row => (
						<GaugeTile
							key={row.key}
							value={pctOf(row.correct, row.total)}
							caption={getDifficultyLabel(row.key)}
							sub={`${row.correct}/${row.total}`}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function SectionCard({
	title,
	sections,
	emptyLabel,
}: {
	title: string;
	sections: SectionAccuracy[];
	emptyLabel: string;
}) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent className="pb-4">
				{sections.length === 0 ? (
					<InlineEmpty>{emptyLabel}</InlineEmpty>
				) : (
					<ul className="divide-border/60 divide-y">
						{sections.map(section => {
							const pct = pctOf(section.correct, section.total);
							const tone = accuracyTone(pct);
							const body = (
								<div className="flex items-center justify-between gap-3 py-2.5">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">
											{section.sectionName ?? "Sezione eliminata"}
										</p>
										{section.courseName && (
											<p className="text-muted-foreground truncate text-xs">
												{section.courseName}
											</p>
										)}
									</div>
									<span className={cn("shrink-0 text-sm font-semibold", tone.ink)}>
										{pct}%
									</span>
								</div>
							);
							return (
								<li key={section.sectionId}>
									{section.path ? (
										<Link
											to={section.path}
											className="hover:bg-muted/40 -mx-2 block rounded-lg px-2 transition-colors"
										>
											{body}
										</Link>
									) : (
										body
									)}
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

export function MasteryPanel({
	mastery,
	sections = true,
}: {
	mastery: UserMastery;
	/** Show the weak/strong section lists. Off on a single-section page, where
	 * there are no sub-sections to rank. */
	sections?: boolean;
}) {
	if (mastery.totalAnswers === 0) return null;

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Padronanza</h2>
			<AccuracyCard byDifficulty={mastery.byDifficulty} />
			{sections && (
				<div className="grid gap-4 lg:grid-cols-2">
					<SectionCard
						title="Aree deboli"
						sections={mastery.weakSections}
						emptyLabel="Nessuna area sotto la soglia. Ottimo lavoro."
					/>
					<SectionCard
						title="Aree forti"
						sections={mastery.strongSections}
						emptyLabel="Continua ad allenarti per costruire le tue aree forti."
					/>
				</div>
			)}
		</div>
	);
}

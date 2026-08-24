import { MedalStarIcon } from "@solar-icons/react/linear/medal-star";
import { TargetIcon } from "@solar-icons/react/linear/target";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { Card, CardContent, CardTexture } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import type { MasteryBreakdown, SectionAccuracy, UserMastery } from "@/lib/user/types";
import { getDifficultyLabel } from "@/lib/user/utils";
import { cn } from "@/lib/utils";

// Fill via the chart status colours, ink via the status text tokens — the
// surface/ink split the design system requires.
function accuracyTone(pct: number) {
	if (pct >= 75) return { fill: "var(--color-success)", ink: "text-success" };
	if (pct >= 50) return { fill: "var(--color-warning)", ink: "text-warning" };
	return { fill: "var(--color-destructive)", ink: "text-danger" };
}

function pctOf(correct: number, total: number) {
	return total === 0 ? 0 : Math.round((correct / total) * 100);
}

// Seconds per question read compactly: "34s", "1m 20s".
function perQuestion(seconds: number) {
	if (seconds < 60) return `${seconds}s`;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return s ? `${m}m ${s}s` : `${m}m`;
}

// The summary card's shell: a muted band around a thin-bordered surface, with an
// optional faded texture on the hero card only.
function Shell({
	texture,
	children,
}: {
	texture?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Card className="bg-muted/30 relative overflow-hidden p-1">
			<div className="bg-card relative overflow-hidden rounded-xl border">
				{texture && <CardTexture placement="top" alpha={0.2} />}
				{children}
			</div>
		</Card>
	);
}

// A top semicircle gauge drawn as discrete ticks, filled left → over the top by
// the value. Pure SVG, so it renders identically on the server and the client.
function TickGauge({
	pct,
	color,
	size = 184,
	ticks = 34,
}: {
	pct: number;
	color: string;
	size?: number;
	ticks?: number;
}) {
	const stroke = 3;
	const outerR = (size - stroke) / 2;
	const innerR = outerR - Math.round(size * 0.12);
	const cx = size / 2;
	const cy = outerR + stroke / 2;
	const height = Math.round(cy + stroke / 2);
	const filled = Math.round((pct / 100) * ticks);

	return (
		<div className="relative shrink-0" style={{ width: size }} aria-hidden>
			<svg width={size} height={height} className="block">
				{Array.from({ length: ticks }, (_, i) => {
					const a = ((180 - (180 * i) / (ticks - 1)) * Math.PI) / 180;
					const dx = Math.cos(a);
					const dy = -Math.sin(a);
					// Round the trig output: Math.cos/sin differ in the last ULP between
					// Node and the browser, which trips React's hydration check.
					const round = (n: number) => Math.round(n * 1000) / 1000;
					return (
						<line
							key={i}
							x1={round(cx + innerR * dx)}
							y1={round(cy + innerR * dy)}
							x2={round(cx + outerR * dx)}
							y2={round(cy + outerR * dy)}
							stroke={i < filled ? color : "hsl(var(--muted))"}
							strokeWidth={stroke}
							strokeLinecap="round"
						/>
					);
				})}
			</svg>
			<div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
				<span className="text-2xl font-bold tabular-nums">{pct}%</span>
				<span className="text-muted-foreground text-xs">Generale</span>
			</div>
		</div>
	);
}

function DifficultyBar({ row }: { row: MasteryBreakdown }) {
	const pct = pctOf(row.correct, row.total);
	const tone = accuracyTone(pct);
	return (
		<div className="flex items-center gap-3">
			<span className="w-20 shrink-0 text-sm">{getDifficultyLabel(row.key)}</span>
			<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
				<div
					className="h-full rounded-full"
					style={{ width: `${pct}%`, backgroundColor: tone.fill }}
				/>
			</div>
			<span
				className={cn(
					"w-9 shrink-0 text-right text-sm font-semibold tabular-nums",
					tone.ink
				)}
			>
				{pct}%
			</span>
			<span className="text-muted-foreground w-14 shrink-0 text-right text-xs tabular-nums">
				{row.correct}/{row.total}
			</span>
		</div>
	);
}

// The overall accuracy as a segmented semicircle gauge with the difficulties as
// bars beside it. Titleless: it is the headline of the "Padronanza" section.
function AccuracyCard({ byDifficulty }: { byDifficulty: MasteryBreakdown[] }) {
	const total = byDifficulty.reduce((sum, row) => sum + row.total, 0);
	const correct = byDifficulty.reduce((sum, row) => sum + row.correct, 0);
	const pct = pctOf(correct, total);

	return (
		<Shell texture>
			<CardContent className="relative p-6">
				<div className="flex flex-col items-center gap-6 sm:flex-row">
					<div className="shrink-0">
						<TickGauge pct={pct} color={accuracyTone(pct).fill} />
						<p className="text-muted-foreground mt-1 text-center text-xs tabular-nums">
							{correct}/{total}
						</p>
					</div>
					<div className="w-full flex-1 space-y-3">
						{byDifficulty.map(row => (
							<DifficultyBar key={row.key} row={row} />
						))}
					</div>
				</div>
			</CardContent>
		</Shell>
	);
}

// A section as a labelled accuracy bar: name + course, the percentage tinted by
// band, an inline bar, and the mean time per question when it is known.
function SectionRow({ section }: { section: SectionAccuracy }) {
	const pct = pctOf(section.correct, section.total);
	const tone = accuracyTone(pct);

	const body = (
		<div className="space-y-1.5 py-2.5">
			<div className="flex items-start justify-between gap-3">
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
				<span className={cn("shrink-0 text-sm font-semibold tabular-nums", tone.ink)}>
					{pct}%
				</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
					<div
						className="h-full rounded-full"
						style={{ width: `${pct}%`, backgroundColor: tone.fill }}
					/>
				</div>
				{section.avgSeconds != null && (
					<span className="text-muted-foreground text-2xs shrink-0 tabular-nums">
						~{perQuestion(section.avgSeconds)}
					</span>
				)}
			</div>
		</div>
	);

	return section.path ? (
		<Link
			to={section.path}
			className="hover:bg-muted/40 -mx-2 block rounded-lg px-2 transition-colors"
		>
			{body}
		</Link>
	) : (
		body
	);
}

// Weak/strong: the title sits outside the card (with a toned icon), the card
// itself is a plain bordered surface — the same title-outside rhythm as the
// rollup and the accuracy block.
function SectionBlock({
	title,
	icon: LeadIcon,
	iconClass,
	sections,
	emptyLabel,
}: {
	title: string;
	icon: Icon;
	iconClass: string;
	sections: SectionAccuracy[];
	emptyLabel: string;
}) {
	return (
		<div className="space-y-2">
			<h3 className="flex items-center gap-1.5 text-sm font-semibold">
				<LeadIcon className={cn("size-4", iconClass)} />
				{title}
			</h3>
			<Shell>
				<CardContent className="p-4">
					{sections.length === 0 ? (
						<InlineEmpty>{emptyLabel}</InlineEmpty>
					) : (
						<ul className="divide-border/60 divide-y">
							{sections.map(section => (
								<li key={section.sectionId}>
									<SectionRow section={section} />
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Shell>
		</div>
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
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-lg font-semibold">Padronanza</h2>
				{mastery.avgSecondsPerQuestion != null && (
					<span className="text-muted-foreground text-xs tabular-nums">
						~{perQuestion(mastery.avgSecondsPerQuestion)} / domanda
					</span>
				)}
			</div>
			<AccuracyCard byDifficulty={mastery.byDifficulty} />
			{sections && (
				<div className="grid gap-4 lg:grid-cols-2">
					<SectionBlock
						title="Aree deboli"
						icon={TargetIcon}
						iconClass="text-warning"
						sections={mastery.weakSections}
						emptyLabel="Nessuna area sotto la soglia. Ottimo lavoro."
					/>
					<SectionBlock
						title="Aree forti"
						icon={MedalStarIcon}
						iconClass="text-success"
						sections={mastery.strongSections}
						emptyLabel="Continua ad allenarti per costruire le tue aree forti."
					/>
				</div>
			)}
		</div>
	);
}

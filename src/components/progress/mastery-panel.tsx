import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { MedalStarIcon } from "@solar-icons/react/linear/medal-star";
import { TargetIcon } from "@solar-icons/react/linear/target";
import { Link } from "@tanstack/react-router";

import { ChartCard } from "@/components/charts";
import type { Icon } from "@/components/icons";
import { CardContent, CardTexture } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { sectionDisplayName } from "@/lib/catalog/constants";
import type { MasteryBreakdown, SectionAccuracy, UserMastery } from "@/lib/user/types";
import { getDifficultyLabel } from "@/lib/user/utils";
import { cn } from "@/lib/utils";

function accuracyTone(pct: number) {
	if (pct >= 75) return { fill: "var(--color-success)", ink: "text-success" };
	if (pct >= 50) return { fill: "var(--color-warning)", ink: "text-warning" };
	return { fill: "var(--color-destructive)", ink: "text-danger" };
}

function pctOf(correct: number, total: number) {
	return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function perQuestion(seconds: number) {
	if (seconds < 60) return `${seconds}s`;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return s ? `${m}m ${s}s` : `${m}m`;
}

function Shell({
	texture,
	fill,
	children,
}: {
	texture?: boolean;
	fill?: boolean;
	children: React.ReactNode;
}) {
	return (
		<InsetCard
			className={cn(fill && "flex-1")}
			panelClassName={cn("relative", fill && "h-full")}
		>
			{texture && <CardTexture placement="top" alpha={0.2} />}
			{children}
		</InsetCard>
	);
}

function InfoDot({ children }: { children: React.ReactNode }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Informazioni"
					className="text-muted-foreground/50 hover:text-muted-foreground inline-flex align-middle transition-colors"
				>
					<InfoCircleIcon className="size-3.5" />
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-64 text-xs font-normal">
				{children}
			</TooltipContent>
		</Tooltip>
	);
}

// Pure SVG: the gauge has to render identically on the server and the client.
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

const DIFFICULTY_STEPS: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

/**
 * Three rising bars, the first `n` filled: the difficulty ladder as a shape,
 * because in this row colour already means accuracy and cannot mean two things.
 */
function DifficultyMeter({ level }: { level: string }) {
	const filled = DIFFICULTY_STEPS[level] ?? 0;
	return (
		<span className="flex items-end gap-[2px]" aria-hidden>
			{[3, 5, 7].map((height, index) => (
				<span
					key={height}
					className={cn(
						"bg-muted-foreground w-[3px] rounded-[1px]",
						index < filled ? "opacity-100" : "opacity-25"
					)}
					style={{ height }}
				/>
			))}
		</span>
	);
}

function DifficultyBar({
	row,
	layout = "inline",
}: {
	row: MasteryBreakdown;
	/** `stacked` puts the bar on its own line — for a narrow column. */
	layout?: "inline" | "stacked";
}) {
	const pct = pctOf(row.correct, row.total);
	const tone = accuracyTone(pct);

	if (layout === "stacked") {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="space-y-2">
						<div className="flex items-center justify-between gap-3">
							<span className="flex items-center gap-2 text-sm font-medium">
								<DifficultyMeter level={row.key} />
								{getDifficultyLabel(row.key)}
							</span>
							<span className={cn("text-sm font-semibold tabular-nums", tone.ink)}>
								{pct}%
							</span>
						</div>
						<div className="bg-muted h-2 overflow-hidden rounded-full">
							<div
								className="h-full rounded-full"
								style={{ width: `${pct}%`, backgroundColor: tone.fill }}
							/>
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent className="tabular-nums">
					{row.correct} risposte corrette su {row.total}
				</TooltipContent>
			</Tooltip>
		);
	}

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

function SectionRow({ section }: { section: SectionAccuracy }) {
	const pct = pctOf(section.correct, section.total);
	const tone = accuracyTone(pct);

	const body = (
		<div className="space-y-1.5 py-2.5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">
						{section.sectionName
							? sectionDisplayName(section.sectionName)
							: "Sezione eliminata"}
					</p>
					{(section.courseCode || section.className) && (
						<p className="text-muted-foreground truncate text-xs">
							{[section.courseCode, section.className].filter(Boolean).join(" · ")}
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
				{/* Reserve the slot even when untimed, so the bars stay aligned across rows. */}
				<span className="text-muted-foreground text-2xs w-10 shrink-0 text-right tabular-nums">
					{section.avgSeconds != null ? `~${perQuestion(section.avgSeconds)}` : ""}
				</span>
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

function SectionBlock({
	title,
	icon: LeadIcon,
	iconClass,
	sections,
	emptyLabel,
	info,
}: {
	title: string;
	icon: Icon;
	iconClass: string;
	sections: SectionAccuracy[];
	emptyLabel: string;
	info?: React.ReactNode;
}) {
	return (
		<div className="flex h-full flex-col gap-2">
			<h3 className="flex items-center gap-1.5 text-sm font-semibold">
				<LeadIcon className={cn("size-4", iconClass)} />
				{title}
				{info && <InfoDot>{info}</InfoDot>}
			</h3>
			<Shell fill>
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
	/** Off on a single-section page, where there are no sub-sections to rank. */
	sections?: boolean;
}) {
	if (mastery.totalAnswers === 0) return null;

	return (
		<TooltipProvider delayDuration={100}>
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-2">
					<h2 className="flex items-center gap-1.5 text-lg font-semibold">
						Padronanza
						<InfoDot>
							Quanto padroneggi gli argomenti, dalle risposte corrette per singola
							domanda (non dal voto dei quiz). «Generale» è l&apos;accuratezza
							complessiva; sotto, la stessa suddivisa per difficoltà.
						</InfoDot>
					</h2>
					{mastery.avgSecondsPerQuestion != null && (
						<span className="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums">
							~{perQuestion(mastery.avgSecondsPerQuestion)} / domanda
							<InfoDot>
								Tempo medio impiegato per rispondere a una domanda, sui quiz
								cronometrati.
							</InfoDot>
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
							info="Sezioni con accuratezza sotto il 60% (almeno 5 risposte)."
						/>
						<SectionBlock
							title="Aree forti"
							icon={MedalStarIcon}
							iconClass="text-success"
							sections={mastery.strongSections}
							emptyLabel="Continua ad allenarti per costruire le tue aree forti."
							info="Sezioni con accuratezza almeno del 75% (almeno 5 risposte)."
						/>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}

/**
 * The same reading as `MasteryPanel`, folded into one narrow column: the gauge on
 * top, the difficulty bars under it, and the areas to go back to at the bottom.
 * For a dashboard grid, where this sits beside a wide chart and has to reach its
 * height without spreading sideways.
 */
export function MasteryCard({
	mastery,
	action,
}: {
	mastery: UserMastery;
	/** The card's closing control — usually a link to the full panel. */
	action?: React.ReactNode;
}) {
	const total = mastery.byDifficulty.reduce((sum, row) => sum + row.total, 0);
	const correct = mastery.byDifficulty.reduce((sum, row) => sum + row.correct, 0);
	const pct = pctOf(correct, total);

	return (
		<TooltipProvider delayDuration={100}>
			<ChartCard
				title={
					<span className="flex items-center gap-1.5">
						Dove sbagli
						<InfoDot>
							Quanto padroneggi gli argomenti, dalle risposte corrette per singola
							domanda — non dal voto dei quiz.
						</InfoDot>
					</span>
				}
				// Short enough not to wrap at the narrow width: the band then matches the
				// two-line header of the wide card beside it, and the panels line up.
				description="Accuratezza per difficoltà"
				texture="top"
				className="h-full"
				actions={
					mastery.avgSecondsPerQuestion != null && (
						<span className="text-muted-foreground text-xs tabular-nums">
							~{perQuestion(mastery.avgSecondsPerQuestion)} / domanda
						</span>
					)
				}
				footer={action}
			>
				{mastery.totalAnswers === 0 ? (
					<InlineEmpty>Nessuna risposta registrata in questo periodo.</InlineEmpty>
				) : (
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center">
							<TickGauge pct={pct} color={accuracyTone(pct).fill} size={200} />
							<p className="text-muted-foreground text-xs tabular-nums">
								{correct}/{total}
							</p>
						</div>

						<div className="space-y-4">
							{mastery.byDifficulty.map(row => (
								<DifficultyBar key={row.key} row={row} layout="stacked" />
							))}
						</div>
					</div>
				)}
			</ChartCard>
		</TooltipProvider>
	);
}

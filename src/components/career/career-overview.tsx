import { type ReactNode, useState } from "react";

import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { BranchingPathsUpIcon } from "@solar-icons/react/linear/branching-paths-up";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import { TargetIcon } from "@solar-icons/react/linear/target";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
	CHART_PLOT_CLASS,
	CHART_SURFACE,
	ComparisonChart,
	RadialGauge,
	TickArc,
} from "@/components/charts";
import type { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { Separator } from "@/components/ui/separator";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { requiredAverage } from "@/lib/crm/career/engine";
import type { Career } from "@/lib/crm/types";
import { cn } from "@/lib/utils";
import { getGradeChartColor } from "@/lib/utils/grading";

import { GradeRing } from "./career-controls";
import {
	GRADUATION_FLOOR,
	averageTrend,
	bonusesOf,
	cfuBreakdown,
	cfuToChoose,
	formatExamDate,
	formatFigure,
	gradeCounts,
	remainingGradedCfu,
	rulesOf,
	summaryOf,
} from "./career-model";

export type CareerTab = "overview" | "record" | "forecast";

function Figure({
	label,
	value,
	tone,
}: {
	label: string;
	value: string;
	tone?: string;
}) {
	return (
		<div className="min-w-0">
			<p className={cn("text-sm font-medium", tone ?? "text-muted-foreground")}>
				{label}
			</p>
			<p
				className={cn(
					"text-3xl font-bold tracking-tight tabular-nums",
					tone ?? "text-foreground"
				)}
			>
				{value}
			</p>
		</div>
	);
}

function AveragesCard({ career }: { career: Career }) {
	const summary = summaryOf(career);
	return (
		<InsetCard title="Media">
			<div className="grid grid-cols-3 gap-4 p-5">
				<Figure label="Aritmetica" value={formatFigure(summary.arithmeticAverage)} />
				<Figure
					label="Ponderata"
					value={formatFigure(summary.weightedAverage)}
					tone="text-brand"
				/>
				<Figure label="Base di laurea" value={formatFigure(summary.base)} />
			</div>
		</InsetCard>
	);
}

function Entry({
	label,
	value,
	strong,
}: {
	label: string;
	value: string;
	strong?: boolean;
}) {
	return (
		<div className="flex items-baseline justify-between gap-4 text-sm">
			<dt className={cn(!strong && "text-muted-foreground")}>{label}</dt>
			<dd className={cn("tabular-nums", strong && "font-semibold")}>{value}</dd>
		</div>
	);
}

function GraduationCard({ career }: { career: Career }) {
	const summary = summaryOf(career);
	const bonuses = bonusesOf(career);
	const final = summary.projectedFinal;
	const points: [string, number][] = [
		["Tesi, al massimo", bonuses.thesis],
		["In corso", bonuses.inCorso],
		["Erasmus", bonuses.erasmus],
		["Altri punti", bonuses.other],
	];

	return (
		<InsetCard
			title="Voto di laurea stimato"
			description={
				career.settingsSaved
					? `Se la media resta ${formatFigure(summary.weightedAverage)} e la tesi prende il massimo.`
					: "Solo dalla media, senza regole di calcolo."
			}
			className="h-full"
		>
			<div className="flex flex-1 flex-col items-center justify-center gap-6 p-5 sm:flex-row">
				<TickArc
					value={(final?.rounded ?? GRADUATION_FLOOR) - GRADUATION_FLOOR}
					max={110 - GRADUATION_FLOOR}
					label={final ? String(final.rounded) : "—"}
					caption="su 110"
					className="w-48"
				/>
				<dl className="flex w-full min-w-0 flex-1 flex-col gap-2">
					<Entry label="Base dalla media" value={formatFigure(summary.base)} />
					{points
						.filter(([, value]) => value > 0)
						.map(([label, value]) => (
							<Entry key={label} label={label} value={`+${formatFigure(value)}`} />
						))}
					<Separator className="my-1" />
					<Entry label="Totale" value={formatFigure(final?.raw ?? null)} strong />
				</dl>
			</div>
		</InsetCard>
	);
}

const SEGMENTS = [
	{ key: "passed", label: "Superati", swatch: "bg-success" },
	{ key: "rejected", label: "Da ridare", swatch: "bg-warning" },
	{ key: "planned", label: "Da sostenere", swatch: "bg-muted-foreground/40" },
	{ key: "toChoose", label: "Da scegliere", swatch: "bg-border" },
] as const;

function CfuCard({ career }: { career: Career }) {
	const totals = cfuBreakdown(career);
	const known = totals.passed + totals.rejected + totals.planned + totals.toChoose;
	const total = Math.max(career.course.cfu ?? 0, known, 1);

	return (
		<InsetCard title="CFU conseguiti">
			<div className="flex items-center gap-5 p-5">
				<RadialGauge
					value={totals.passed}
					max={total}
					label={String(totals.passed)}
					caption={`di ${total}`}
					color="var(--color-success)"
					size={104}
				/>
				<ul className="flex min-w-0 flex-1 flex-col gap-1.5">
					{SEGMENTS.map(segment => (
						<li key={segment.key} className="flex items-center gap-2 text-sm">
							<span className={cn("size-2.5 shrink-0 rounded-full", segment.swatch)} />
							<span className="text-muted-foreground flex-1">{segment.label}</span>
							<span className="font-semibold tabular-nums">{totals[segment.key]}</span>
						</li>
					))}
				</ul>
			</div>
		</InsetCard>
	);
}

const SERIES = ["arithmetic", "weighted"] as const;

const HISTORY_CONFIG = {
	arithmetic: { label: "Aritmetica", color: "var(--color-muted-foreground)" },
	weighted: { label: "Ponderata", color: "var(--color-primary)" },
} satisfies ChartConfig;

function HistoryCard({ career }: { career: Career }) {
	const data = averageTrend(career);
	const reduced = useReducedMotion();
	const [active, setActive] = useState<number | null>(null);
	const point = data[active ?? data.length - 1];

	return (
		<InsetCard title="Storico della media">
			{!point ? (
				<InlineEmpty>La linea parte dal primo esame superato con voto.</InlineEmpty>
			) : (
				<div className="flex flex-col gap-4 p-5">
					<div className="flex items-center gap-3">
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold">{point.name}</p>
							<p className="text-muted-foreground text-sm">
								{point.cfu} CFU · {formatExamDate(point.date)}
							</p>
						</div>
						<GradeRing step={point.step} size={44} />
					</div>
					<Separator />
					<ChartContainer
						config={HISTORY_CONFIG}
						className={cn("aspect-auto h-56 w-full", CHART_PLOT_CLASS)}
					>
						<LineChart
							data={data}
							margin={{ left: 4, right: 8, top: 8 }}
							onMouseMove={state => {
								const index = Number(state.activeTooltipIndex);
								setActive(Number.isFinite(index) ? index : null);
							}}
							onMouseLeave={() => setActive(null)}
						>
							<CartesianGrid vertical={false} stroke="hsl(var(--border))" />
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								tickFormatter={formatExamDate}
							/>
							<YAxis
								domain={["dataMin - 0.5", "dataMax + 0.5"]}
								tickLine={false}
								axisLine={false}
								width={40}
								tickFormatter={value => formatFigure(Math.round(value * 10) / 10)}
							/>
							<ChartTooltip
								cursor={{ stroke: "hsl(var(--border))", strokeWidth: 2 }}
								content={() => null}
							/>
							{SERIES.map(key => (
								<Line
									key={key}
									type="monotone"
									dataKey={key}
									stroke={`var(--color-${key})`}
									strokeWidth={2.5}
									dot={{ r: 3.5, strokeWidth: 2, fill: CHART_SURFACE }}
									activeDot={{ r: 5, strokeWidth: 2, stroke: CHART_SURFACE }}
									isAnimationActive={!reduced}
								/>
							))}
						</LineChart>
					</ChartContainer>
					<div className="flex justify-center gap-10">
						{SERIES.map(key => (
							<div key={key} className="text-center">
								<p
									className={cn(
										"text-3xl font-bold tracking-tight tabular-nums",
										key === "weighted" && "text-brand"
									)}
								>
									{formatFigure(point[key])}
								</p>
								<p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
									<span
										className={cn(
											"size-2.5 rounded-full",
											key === "weighted" ? "bg-primary" : "bg-muted-foreground"
										)}
									/>
									{HISTORY_CONFIG[key].label}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</InsetCard>
	);
}

function DistributionCard({ career }: { career: Career }) {
	return (
		<ComparisonChart
			title="Distribuzione dei voti"
			data={gradeCounts(career)}
			categoryKey="grade"
			series={[{ key: "count", label: "Esami" }]}
			barColor={datum => getGradeChartColor(datum.step)}
			wholeValues
			showTrack={false}
			height={220}
			emptyMessage="Ancora nessun voto."
		/>
	);
}

function Step({
	icon: Glyph,
	tone,
	children,
	action,
	onAction,
}: {
	icon: Icon;
	tone: string;
	children: ReactNode;
	action: string;
	onAction: () => void;
}) {
	return (
		<li className="flex items-center gap-3 px-4 py-3">
			<span
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-lg",
					tone
				)}
			>
				<Glyph className="size-4" />
			</span>
			<p className="min-w-0 flex-1 text-sm text-pretty">{children}</p>
			<Button variant="ghost" size="sm" onClick={onAction}>
				{action}
				<AltArrowRightIcon className="size-4" />
			</Button>
		</li>
	);
}

function NextSteps({
	career,
	onNavigate,
}: {
	career: Career;
	onNavigate: (tab: CareerTab) => void;
}) {
	const toChoose = cfuToChoose(career);
	const rejected = career.exams.filter(exam => exam.status === "REJECTED");
	const goal = requiredAverage({
		exams: career.exams,
		remainingGradedCfu: remainingGradedCfu(career),
		target: 110,
		bonuses: bonusesOf(career),
		rules: rulesOf(career),
	});

	return (
		<InsetCard title="Cosa ti manca" className="h-full">
			<ul className="divide-border/60 divide-y">
				{toChoose > 0 && (
					<Step
						icon={BranchingPathsUpIcon}
						tone="bg-info/10 text-info"
						action="Scegli"
						onAction={() => onNavigate("record")}
					>
						Ti mancano {toChoose} CFU di esami a scelta per arrivare ai{" "}
						{career.course.cfu} del corso.
					</Step>
				)}
				{rejected.map(exam => (
					<Step
						key={exam.id}
						icon={RestartIcon}
						tone="bg-warning/10 text-warning"
						action="Apri"
						onAction={() => onNavigate("record")}
					>
						<span className="font-medium">{exam.name}</span> è da ridare
						{exam.grade !== null && `: hai rifiutato ${exam.grade}`}.
					</Step>
				))}
				<Step
					icon={TargetIcon}
					tone="bg-primary/10 text-brand"
					action="Prevedi"
					onAction={() => onNavigate("forecast")}
				>
					{goal.status === "possible" &&
						`Per uscire con 110 ti serve ${formatFigure(Math.round(goal.average * 10) / 10)} di media negli esami che mancano.`}
					{goal.status === "reached" &&
						"Per il 110 basta superare gli esami che mancano."}
					{goal.status === "impossible" && "Il 110 non è più raggiungibile."}
				</Step>
			</ul>
		</InsetCard>
	);
}

export function CareerOverview({
	career,
	onNavigate,
}: {
	career: Career;
	onNavigate: (tab: CareerTab) => void;
}) {
	return (
		<div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
			<div className="flex flex-col gap-6">
				<AveragesCard career={career} />
				<CfuCard career={career} />
			</div>
			<GraduationCard career={career} />
			<div className="lg:col-span-2">
				<HistoryCard career={career} />
			</div>
			<DistributionCard career={career} />
			<NextSteps career={career} onNavigate={onNavigate} />
		</div>
	);
}

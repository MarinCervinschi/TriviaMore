import { useId, useMemo, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import {
	Area,
	Bar,
	BarChart,
	CartesianGrid,
	ComposedChart,
	Line,
	XAxis,
	YAxis,
} from "recharts";

import { CHART_SLOTS } from "@/components/charts";
import type { Icon } from "@/components/icons";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { SelectChip } from "@/components/shared/select-chip";
import { CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
	type DayRange,
	type ExplorerMode,
	type ExplorerPeriod,
	METRIC_FAMILY,
	type MetricKey,
	buildMetricWindow,
	buildQualityRows,
	formatDayLabel,
	metricPoint,
	metricValue,
	pickTotals,
	qualityDomain,
} from "@/lib/user/metric-explorer";
import type { DailyStudyStat } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { formatGradeOutOf33 } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

type Series = { key: string; label: string; color: string };

/** What a metric is called, how it is coloured and how it is formatted: one table,
 * so the tabs, the headline cards and any future export agree. */
export const METRICS: { key: MetricKey; label: string; color: string; icon: Icon }[] = [
	{ key: "quizzes", label: "Quiz", color: "var(--color-chart-1)", icon: CupFirstIcon },
	{
		key: "grade",
		label: "Media voto",
		color: "var(--color-chart-3)",
		icon: GraphUpIcon,
	},
	{
		key: "accuracy",
		label: "Accuratezza",
		color: "var(--color-chart-2)",
		icon: CheckCircleIcon,
	},
	{ key: "time", label: "Tempo", color: "var(--color-chart-4)", icon: ClockCircleIcon },
];

const COMPARE: Series[] = [
	{ key: "studio", label: "Studio", color: CHART_SLOTS[0] },
	{ key: "esame", label: "Esame", color: CHART_SLOTS[2] },
];

export const FORMAT: Record<MetricKey, (n: number) => string> = {
	quizzes: n => String(Math.round(n)),
	grade: n => formatGradeOutOf33(n),
	accuracy: n => `${Math.round(n)}%`,
	time: n => formatTimeSpent(n),
};

function pctChange(current: number, previous: number): number {
	return previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
}

/** Mini-glyphs that show the plot style itself, so the toggle needs no words. */
type Formatter = (n: number) => string;

/** One tooltip row: the swatch, the series label, the formatted value. */
function TooltipRow({
	color,
	label,
	value,
}: {
	color?: string;
	label: string;
	value: string;
}) {
	return (
		<>
			<span
				className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
				style={{ backgroundColor: color }}
			/>
			<div className="flex flex-1 items-center justify-between gap-3 leading-none">
				<span className="text-muted-foreground">{label}</span>
				<span className="text-foreground font-medium tabular-nums">{value}</span>
			</div>
		</>
	);
}

function chartConfig(series: Series[]): ChartConfig {
	return Object.fromEntries(
		series.map(s => [s.key, { label: s.label, color: s.color }])
	);
}

function GridAndAxis({ hideY }: { hideY?: boolean }) {
	return (
		<>
			<CartesianGrid vertical={false} stroke="hsl(var(--border))" />
			<XAxis
				dataKey="label"
				tickLine={false}
				axisLine={false}
				tickMargin={10}
				minTickGap={24}
			/>
			{hideY && <YAxis hide />}
		</>
	);
}

/**
 * A flow — a count or a sum. Columns, not an area: an area asserts a path
 * *between* two buckets, and a month with no quizzes is an absence, not a
 * descent. Its zero is the true value, so nothing here is nulled out.
 */
function FlowChart({
	points,
	series,
	metricKey,
	height = 300,
}: {
	points: Record<string, number | string>[];
	series: Series[];
	metricKey: MetricKey;
	height?: number;
}) {
	const reduced = useReducedMotion();
	const fmt: Formatter = FORMAT[metricKey];
	const config = chartConfig(series);

	return (
		<ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
			<BarChart data={points} margin={{ left: 8, right: 12, top: 8 }}>
				<GridAndAxis hideY />
				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={(value, name) => (
								<TooltipRow
									color={config[String(name)]?.color}
									label={String(config[String(name)]?.label ?? name)}
									value={fmt(value as number)}
								/>
							)}
						/>
					}
				/>
				{series.map(s => (
					<Bar
						key={s.key}
						dataKey={s.key}
						fill={`var(--color-${s.key})`}
						radius={[6, 6, 0, 0]}
						maxBarSize={44}
						isAnimationActive={!reduced}
						animationDuration={420}
					/>
				))}
			</BarChart>
		</ChartContainer>
	);
}

/**
 * A ratio — a grade average or an accuracy. Read at *day* resolution on a time
 * axis: a dot for the days that side studied, and the running average as the
 * line, which holds flat across a gap because an average does not move when
 * nothing is added to it. No point is ever invented for an empty period.
 */
type Curve = "step" | "smooth";

/** The two line shapes, drawn: a toggle that shows what it does needs no label. */
function GlyphSmooth() {
	return (
		<svg viewBox="0 0 24 12" width="20" height="10" fill="none" aria-hidden>
			<path
				d="M2 9 C 7 2, 10 2, 14 6 S 19 3, 22 2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function GlyphStep() {
	return (
		<svg viewBox="0 0 24 12" width="20" height="10" fill="none" aria-hidden>
			<path
				d="M2 10 H7 V7 H13 V5 H18 V2 H22"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function QualityChart({
	rows,
	series,
	metricKey,
	range,
	ticks,
	curve,
	height = 300,
}: {
	rows: Record<string, number | null>[];
	series: Series[];
	metricKey: MetricKey;
	range: DayRange;
	ticks: { day: number; label: string }[];
	/** `step` is the literal shape — the average holds until the next quiz. */
	curve: Curve;
	height?: number;
}) {
	const scope = `mq-${useId().replace(/:/g, "")}`;
	const reduced = useReducedMotion();
	const fmt: Formatter = FORMAT[metricKey];
	const config = chartConfig(series);
	const tickLabel = new Map(ticks.map(t => [t.day, t.label]));

	const values = rows.flatMap(row =>
		Object.entries(row)
			.filter(([key, value]) => key !== "t" && typeof value === "number")
			.map(([, value]) => value as number)
	);

	return (
		<ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
			<ComposedChart data={rows} margin={{ left: 8, right: 12, top: 8 }}>
				<defs>
					{series.map(s => (
						<linearGradient
							key={s.key}
							id={`${scope}-fill-${s.key}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="0%"
								stopColor={`var(--color-${s.key})`}
								stopOpacity={0.18}
							/>
							<stop
								offset="95%"
								stopColor={`var(--color-${s.key})`}
								stopOpacity={0.02}
							/>
						</linearGradient>
					))}
				</defs>
				<CartesianGrid vertical={false} stroke="hsl(var(--border))" />
				<XAxis
					dataKey="t"
					type="number"
					domain={[range.fromDay, range.toDay]}
					ticks={ticks.map(t => t.day)}
					tickFormatter={(day: number) => tickLabel.get(day) ?? formatDayLabel(day)}
					tickLine={false}
					axisLine={false}
					tickMargin={10}
					minTickGap={24}
				/>
				<YAxis hide domain={qualityDomain(metricKey, values)} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							labelFormatter={(_, payload) =>
								formatDayLabel(Number(payload?.[0]?.payload?.t ?? range.toDay))
							}
							formatter={(value, name, item) => {
								const row = item?.payload as Record<string, number | null>;
								const cum = row?.[`${String(name)}Cum`];
								const own = typeof value === "number" ? fmt(value) : "—";
								return (
									<TooltipRow
										color={config[String(name)]?.color}
										label={String(config[String(name)]?.label ?? name)}
										value={typeof cum === "number" ? `${own} · media ${fmt(cum)}` : own}
									/>
								);
							}}
						/>
					}
				/>
				{series.map(s => (
					<Area
						key={`${s.key}-cum`}
						type={curve === "smooth" ? "monotone" : "stepAfter"}
						dataKey={`${s.key}Cum`}
						stroke={`var(--color-${s.key})`}
						strokeWidth={2}
						strokeLinecap="round"
						fill={`url(#${scope}-fill-${s.key})`}
						dot={false}
						activeDot={false}
						connectNulls
						legendType="none"
						tooltipType="none"
						isAnimationActive={!reduced}
						animationDuration={420}
					/>
				))}
				{series.map(s => (
					<Line
						key={s.key}
						type="linear"
						dataKey={s.key}
						stroke="none"
						dot={{
							r: 3,
							fill: `var(--color-${s.key})`,
							stroke: "var(--color-card)",
							strokeWidth: 1.5,
						}}
						activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
						isAnimationActive={!reduced}
						animationDuration={420}
					/>
				))}
			</ComposedChart>
		</ChartContainer>
	);
}

const PERIOD_OPTIONS: { value: ExplorerPeriod; label: string }[] = [
	{ value: "week", label: "Sett" },
	{ value: "month", label: "Mese" },
	{ value: "year", label: "Anno" },
	{ value: "all", label: "Tutto" },
];
const MODE_OPTIONS: { value: ExplorerMode; label: string; icon: Icon }[] = [
	{ value: "STUDY", label: "Studio", icon: BookIcon },
	{ value: "EXAM_SIMULATION", label: "Esame", icon: DiplomaIcon },
	{ value: "both", label: "Entrambi", icon: LayersIcon },
];
/** Round the tab that lands on a top corner — and only that layout's corner. */
function cornerClass(index: number, count: number): string {
	return cn(
		index === 0 && "rounded-tl-xl",
		index === 1 && "rounded-tr-xl md:rounded-tr-none",
		index === count - 1 && "md:rounded-tr-xl"
	);
}

/**
 * The drill-down analytics card, reused as-is for the whole account and for a
 * single section, class or course — only `daily` changes. `today` is injected in
 * stories for determinism.
 */
export function MetricExplorer({
	daily,
	today,
	initialMetric = "grade",
	period: controlledPeriod,
	mode: controlledMode,
}: {
	daily: DailyStudyStat[];
	today?: Date;
	/** Which tab a story opens on; the app lands on the grade. */
	initialMetric?: MetricKey;
	/**
	 * Pass both to let the page own the window: the card then drops its own two
	 * chips, which would otherwise be the twins of the ones in the page toolbar.
	 */
	period?: ExplorerPeriod;
	mode?: ExplorerMode;
}) {
	const controlled = controlledPeriod !== undefined && controlledMode !== undefined;
	const [metric, setMetric] = useState<MetricKey>(initialMetric);
	const [ownPeriod, setPeriod] = useState<ExplorerPeriod>("all");
	const [ownMode, setMode] = useState<ExplorerMode>("both");
	const [curve, setCurve] = useState<Curve>("smooth");
	const period = controlledPeriod ?? ownPeriod;
	const mode = controlledMode ?? ownMode;

	const now = useMemo(() => today ?? new Date(), [today]);
	const { buckets, previous, range } = useMemo(
		() => buildMetricWindow(daily, period, now),
		[daily, period, now]
	);

	const windowTotals = useMemo(() => {
		const total = {
			quizzes: 0,
			gradeSum: 0,
			timeSpent: 0,
			answersTotal: 0,
			answersCorrect: 0,
		};
		for (const bucket of buckets) {
			const side = pickTotals(bucket, mode);
			total.quizzes += side.quizzes;
			total.gradeSum += side.gradeSum;
			total.timeSpent += side.timeSpent;
			total.answersTotal += side.answersTotal;
			total.answersCorrect += side.answersCorrect;
		}
		return total;
	}, [buckets, mode]);

	const prevTotals = pickTotals(previous, mode);

	const tabs = METRICS.map(m => {
		const current = metricValue(windowTotals, m.key);
		const prev = metricValue(prevTotals, m.key);
		return {
			...m,
			value: FORMAT[m.key](current),
			delta: prev === 0 ? null : pctChange(current, prev),
		};
	});

	const active = METRICS.find(m => m.key === metric)!;
	const series: Series[] =
		mode === "both"
			? COMPARE
			: [{ key: "value", label: active.label, color: active.color }];
	const family = METRIC_FAMILY[metric];
	const points: Record<string, number | string>[] = buckets.map(bucket => {
		const row: Record<string, number | string> = { label: bucket.label };
		const read = (totals: Parameters<typeof metricValue>[0]) =>
			metricPoint(totals, metric) as number | string;
		if (mode === "both") {
			row.studio = read(bucket.studio);
			row.esame = read(bucket.esame);
		} else {
			row.value = read(pickTotals(bucket, mode));
		}
		return row;
	});
	const qualityRows = useMemo(
		() => (family === "quality" ? buildQualityRows(daily, metric, mode, range) : []),
		[family, daily, metric, mode, range]
	);
	const ticks = buckets.map(bucket => ({
		day: bucket.startDay,
		label: bucket.label,
	}));
	const hasData = windowTotals.quizzes > 0;
	// The whole span has no earlier window to compare against, so the tabs never
	// carry a delta there — the range says what the figures cover instead.
	const spanLabel = period === "all" ? buckets[0]?.label : null;

	return (
		<InsetCard
			className="h-full"
			header={
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<CardTitle className="text-base">Andamento</CardTitle>
						<p className="text-muted-foreground mt-0.5 text-sm">
							{family === "quality"
								? "La media cumulativa, e un punto per giornata di studio"
								: "Il totale di ogni periodo"}
							{spanLabel && ` · dal ${spanLabel}`}
						</p>
					</div>
					<div className="flex shrink-0 flex-wrap items-center gap-2">
						{family === "quality" && (
							<div className="bg-muted/60 flex items-center gap-0.5 rounded-lg p-0.5">
								{(
									[
										{ value: "smooth", label: "Linea morbida", glyph: <GlyphSmooth /> },
										{ value: "step", label: "Linea a gradini", glyph: <GlyphStep /> },
									] as const
								).map(option => (
									<button
										key={option.value}
										type="button"
										onClick={() => setCurve(option.value)}
										aria-pressed={curve === option.value}
										// The glyph is the whole control, so the name lives here: a
										// drawing is not an accessible name.
										aria-label={option.label}
										className={cn(
											"flex items-center rounded-md px-2 py-1.5 transition-colors",
											curve === option.value
												? "bg-background text-foreground shadow-xs"
												: "text-muted-foreground hover:text-foreground"
										)}
									>
										{option.glyph}
									</button>
								))}
							</div>
						)}
						{!controlled && (
							<>
								<SelectChip
									label="Modalità"
									value={mode}
									onChange={setMode}
									options={MODE_OPTIONS}
								/>
								<SelectChip
									label="Periodo"
									value={period}
									onChange={setPeriod}
									options={PERIOD_OPTIONS}
									lead={CalendarMinimalisticIcon}
								/>
							</>
						)}
					</div>
				</div>
			}
			footer={
				hasData && (
					<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
						<span className="text-muted-foreground flex items-center gap-2 text-xs">
							<InfoCircleIcon className="size-3.5 shrink-0" />
							{family === "quality"
								? "I punti sono le giornate di studio; la linea è la media cumulativa e resta piatta quando non studi."
								: "Un periodo senza quiz vale zero: è un valore, non un buco."}
						</span>
						<span className="flex items-center gap-3">
							{series.map(item => (
								<span
									key={item.key}
									className="text-muted-foreground flex items-center gap-1.5 text-xs"
								>
									<span
										className="size-2 shrink-0 rounded-[3px]"
										style={{ backgroundColor: item.color }}
									/>
									{item.label}
								</span>
							))}
						</span>
					</div>
				)
			}
		>
			<div className="grid grid-cols-2 divide-x divide-y md:grid-cols-4 md:divide-y-0">
				{tabs.map((tab, i) => {
					const isActive = tab.key === metric;
					const TabIcon = tab.icon;
					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => setMetric(tab.key)}
							className={cn(
								"relative flex flex-col gap-1.5 border-t-2 p-4 text-left transition-colors",
								cornerClass(i, tabs.length),
								isActive ? "bg-muted/30" : "hover:bg-muted/20 border-t-transparent"
							)}
							style={isActive ? { borderTopColor: tab.color } : undefined}
						>
							<div className="flex items-center justify-between gap-2">
								<span className="text-muted-foreground flex items-center gap-1.5 text-sm">
									<TabIcon className="h-4 w-4" />
									{tab.label}
								</span>
								<DeltaBadge value={tab.delta} />
							</div>
							<span
								className={cn(
									"text-2xl font-bold tabular-nums",
									!isActive && "text-muted-foreground"
								)}
							>
								{tab.value}
							</span>
						</button>
					);
				})}
			</div>

			<div className="border-t p-4 pt-6">
				{!hasData ? (
					<InlineEmpty>Nessuna attività in questo periodo.</InlineEmpty>
				) : family === "flow" ? (
					<FlowChart points={points} series={series} metricKey={metric} />
				) : (
					<QualityChart
						rows={qualityRows}
						series={series}
						metricKey={metric}
						range={range}
						ticks={ticks}
						curve={curve}
					/>
				)}
			</div>
		</InsetCard>
	);
}

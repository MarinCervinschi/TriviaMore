import { type ReactNode, useId, useMemo, useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { BookIcon } from "@solar-icons/react/linear/book";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { CHART_SLOTS } from "@/components/charts";
import type { Icon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineEmpty } from "@/components/ui/empty-state";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
	type ExplorerMode,
	type ExplorerPeriod,
	type MetricKey,
	buildMetricWindow,
	metricValue,
	pickTotals,
} from "@/lib/user/metric-explorer";
import type { DailyStudyStat } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { formatGradeOutOf33 } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

type ChartType = "dots" | "line";
type Series = { key: string; label: string; color: string };

const METRICS: { key: MetricKey; label: string; color: string; icon: Icon }[] = [
	{ key: "quizzes", label: "Quiz", color: "var(--color-chart-1)", icon: CupFirstIcon },
	{
		key: "grade",
		label: "Voto medio",
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

const FORMAT: Record<MetricKey, (n: number) => string> = {
	quizzes: n => String(Math.round(n)),
	grade: n => formatGradeOutOf33(n),
	accuracy: n => `${Math.round(n)}%`,
	time: n => formatTimeSpent(n),
};

const DOMAIN: Partial<Record<MetricKey, [number, number]>> = {
	grade: [0, 33],
	accuracy: [0, 100],
};

function pctChange(current: number, previous: number): number {
	return previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
}

// ── controls ─────────────────────────────────────────────────────────────────

type ChipOption<T extends string> = {
	value: T;
	label: string;
	icon?: Icon;
	glyph?: ReactNode;
};

// A single-select "filter chip": shows the current choice and opens a radio
// menu to change it — the same read as the data-table filter chips, applied to
// the explorer's mode / period / chart type.
function SelectChip<T extends string>({
	label,
	value,
	onChange,
	options,
	lead: Lead,
}: {
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: ChipOption<T>[];
	lead?: Icon;
}) {
	const current = options.find(option => option.value === value);
	const CurrentIcon = current?.icon;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className="border-border bg-background hover:bg-muted/50 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors"
				>
					{Lead ? (
						<Lead className="text-muted-foreground size-3.5" />
					) : CurrentIcon ? (
						<CurrentIcon className="text-muted-foreground size-3.5" />
					) : (
						current?.glyph
					)}
					<span className="font-medium">{current?.label ?? label}</span>
					<AltArrowDownIcon className="text-muted-foreground size-3.5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-40">
				<DropdownMenuLabel>{label}</DropdownMenuLabel>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={next => onChange(next as T)}
				>
					{options.map(option => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Mini-glyphs that show the plot style itself, so the toggle needs no words. */
function GlyphDots() {
	return (
		<svg viewBox="0 0 24 12" width="24" height="12" fill="none" aria-hidden>
			<path
				d="M2 9 L9 4 L15 7 L22 2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeDasharray="3 3"
				strokeLinecap="round"
			/>
			{[
				[2, 9],
				[9, 4],
				[15, 7],
				[22, 2],
			].map(([x, y]) => (
				<circle key={`${x}`} cx={x} cy={y} r="1.7" fill="currentColor" />
			))}
		</svg>
	);
}

function GlyphLine() {
	return (
		<svg viewBox="0 0 24 12" width="24" height="12" fill="none" aria-hidden>
			<path
				d="M2 9 C 7 2, 10 2, 14 6 S 19 3, 22 2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function DeltaBadge({ delta }: { delta: number | null }) {
	if (delta === null) return null;
	const tone =
		delta > 0
			? "text-success bg-success/10"
			: delta < 0
				? "text-danger bg-danger/10"
				: "text-muted-foreground bg-muted";
	return (
		<span
			className={cn(
				"rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
				tone
			)}
		>
			{delta > 0 ? "+" : ""}
			{delta}%
		</span>
	);
}

// ── chart ────────────────────────────────────────────────────────────────────

/** A point marker with an expanding halo — gated by reduced motion. */
function PulseDot({
	cx,
	cy,
	color,
	index,
	reduced,
}: {
	cx: number;
	cy: number;
	color: string;
	index: number;
	reduced: boolean;
}) {
	const begin = `${(index % 5) * 0.18}s`;
	return (
		<g>
			{!reduced && (
				<circle cx={cx} cy={cy} r={4} fill={color} opacity={0.35}>
					<animate
						attributeName="r"
						values="4;12;4"
						dur="1.8s"
						begin={begin}
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.4;0;0.4"
						dur="1.8s"
						begin={begin}
						repeatCount="indefinite"
					/>
				</circle>
			)}
			<circle
				cx={cx}
				cy={cy}
				r={4}
				fill={color}
				stroke="var(--color-card)"
				strokeWidth={2}
			/>
		</g>
	);
}

function MetricChart({
	points,
	series,
	metricKey,
	chartType,
	height = 300,
}: {
	points: Record<string, number | string>[];
	series: Series[];
	metricKey: MetricKey;
	chartType: ChartType;
	height?: number;
}) {
	const scope = `mx-${useId().replace(/:/g, "")}`;
	const reduced = useReducedMotion();
	const fmt = FORMAT[metricKey];
	const dots = chartType === "dots";
	const config: ChartConfig = Object.fromEntries(
		series.map(s => [s.key, { label: s.label, color: s.color }])
	);

	const makeDot =
		(color: string) => (props: { cx?: number; cy?: number; index?: number }) =>
			props.cx == null || props.cy == null ? (
				<g key={`e${props.index}`} />
			) : (
				<PulseDot
					key={props.index}
					cx={props.cx}
					cy={props.cy}
					color={color}
					index={props.index ?? 0}
					reduced={reduced}
				/>
			);

	return (
		<ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
			<AreaChart data={points} margin={{ left: 8, right: 12, top: 8 }}>
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
								stopOpacity={0.22}
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
					dataKey="label"
					tickLine={false}
					axisLine={false}
					tickMargin={10}
					minTickGap={24}
				/>
				<YAxis hide domain={DOMAIN[metricKey]} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={(value, name) => (
								<>
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
										style={{ backgroundColor: config[String(name)]?.color }}
									/>
									<div className="flex flex-1 items-center justify-between gap-3 leading-none">
										<span className="text-muted-foreground">
											{config[String(name)]?.label ?? name}
										</span>
										<span className="text-foreground font-medium tabular-nums">
											{fmt(value as number)}
										</span>
									</div>
								</>
							)}
						/>
					}
				/>
				{series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
				{series.map(s => (
					<Area
						key={s.key}
						type={dots ? "linear" : "monotone"}
						dataKey={s.key}
						stroke={`var(--color-${s.key})`}
						strokeWidth={2}
						strokeLinecap="round"
						strokeDasharray={dots ? "6 6" : undefined}
						fill={`url(#${scope}-fill-${s.key})`}
						dot={dots ? makeDot(s.color) : false}
						activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
						isAnimationActive={!reduced}
						animationDuration={420}
					/>
				))}
			</AreaChart>
		</ChartContainer>
	);
}

// ── the card ─────────────────────────────────────────────────────────────────

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
const TYPE_OPTIONS: { value: ChartType; label: string; glyph: ReactNode }[] = [
	{ value: "dots", label: "Punti", glyph: <GlyphDots /> },
	{ value: "line", label: "Linea", glyph: <GlyphLine /> },
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
 * The drill-down analytics card: the four study metrics as tabs that swap the
 * chart, with out-of-card chips for mode / period / plot style. Reused as-is for
 * the whole account and for a single section, class or course — only `daily`
 * changes. `today` is injected in stories for determinism.
 */
export function MetricExplorer({
	daily,
	today,
}: {
	daily: DailyStudyStat[];
	today?: Date;
}) {
	const [metric, setMetric] = useState<MetricKey>("grade");
	const [period, setPeriod] = useState<ExplorerPeriod>("month");
	const [mode, setMode] = useState<ExplorerMode>("STUDY");
	const [chartType, setChartType] = useState<ChartType>("dots");

	const now = useMemo(() => today ?? new Date(), [today]);
	const { buckets, previous } = useMemo(
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
	const points: Record<string, number | string>[] = buckets.map(bucket => {
		const row: Record<string, number | string> = { label: bucket.label };
		if (mode === "both") {
			row.studio = metricValue(bucket.studio, metric);
			row.esame = metricValue(bucket.esame, metric);
		} else {
			row.value = metricValue(pickTotals(bucket, mode), metric);
		}
		return row;
	});
	const hasData = windowTotals.quizzes > 0;

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h2 className="text-lg font-semibold">Andamento</h2>
				<div className="flex flex-wrap items-center gap-2">
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
					<SelectChip
						label="Tipo grafico"
						value={chartType}
						onChange={setChartType}
						options={TYPE_OPTIONS}
					/>
				</div>
			</div>

			<Card className="bg-muted/30 overflow-hidden p-1">
				<div className="bg-card overflow-hidden rounded-xl border">
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
										<DeltaBadge delta={tab.delta} />
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
						{hasData ? (
							<MetricChart
								points={points}
								series={series}
								metricKey={metric}
								chartType={chartType}
							/>
						) : (
							<InlineEmpty>Nessuna attività in questo periodo.</InlineEmpty>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}

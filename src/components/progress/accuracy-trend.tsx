import { useMemo, useState } from "react";

import { format } from "date-fns";
import { it } from "date-fns/locale";

import { CHART_SLOTS, TimeSeriesChart } from "@/components/charts";
import type { ChartSeries } from "@/components/charts";
import { Button } from "@/components/ui/button";
import {
	THIN_TREND_THRESHOLD,
	buildTrendSeries,
	computeTrendStats,
} from "@/lib/user/trend";
import type { Granularity, TrendPoint, TrendStats } from "@/lib/user/trend";
import type { AttemptHistoryEntry } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { formatThirtyScaleGrade } from "@/lib/utils/grading";

// Only the fields the trend reads — so the chart is reusable and easy to fixture.
type TrendAttempt = Pick<AttemptHistoryEntry, "completedAt" | "score" | "quizMode">;

type ModeFilter = "confronto" | "STUDY" | "EXAM_SIMULATION";

const MODE_TABS: { value: ModeFilter; label: string }[] = [
	{ value: "confronto", label: "Confronto" },
	{ value: "STUDY", label: "Studio" },
	{ value: "EXAM_SIMULATION", label: "Esame" },
];

// Fixed colours per mode, so a series keeps its identity whether it is compared
// or shown alone.
const STUDIO_SERIES: ChartSeries<TrendPoint> = {
	key: "studio",
	label: "Studio",
	color: CHART_SLOTS[0],
};
const ESAME_SERIES: ChartSeries<TrendPoint> = {
	key: "esame",
	label: "Esame",
	color: CHART_SLOTS[2],
};

const SERIES: Record<ModeFilter, ChartSeries<TrendPoint>[]> = {
	confronto: [STUDIO_SERIES, ESAME_SERIES],
	STUDY: [STUDIO_SERIES],
	EXAM_SIMULATION: [ESAME_SERIES],
};

function formatBucketLabel(bucket: string, granularity: Granularity) {
	const [year, month, day] = bucket.split("-").map(Number);
	const date = new Date(year!, month! - 1, day);
	return granularity === "month"
		? format(date, "LLL yy", { locale: it })
		: format(date, "d MMM", { locale: it });
}

function signed(value: number) {
	const sign = value > 0 ? "+" : value < 0 ? "−" : "";
	return `${sign}${Math.abs(value)}`;
}

function consistencyWord(stdev: number) {
	if (stdev <= 2) return "molto costante";
	if (stdev <= 4) return "costante";
	return "variabile";
}

function TrendFooter({ stats }: { stats: TrendStats }) {
	if (stats.count === 0) return null;

	if (stats.thin) {
		return (
			<p className="text-muted-foreground text-xs">
				Servono almeno {THIN_TREND_THRESHOLD} tentativi per un andamento affidabile —{" "}
				{stats.count} finora.
			</p>
		);
	}

	const direction =
		stats.delta > 0
			? {
					label: `In miglioramento (${signed(stats.delta)})`,
					className: "text-success",
				}
			: stats.delta < 0
				? { label: `In calo (${signed(stats.delta)})`, className: "text-danger" }
				: { label: "Stabile", className: "text-muted-foreground" };

	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
			<span className={cn("font-medium", direction.className)}>{direction.label}</span>
			<span className="text-muted-foreground">
				Costanza: σ {stats.stdev} ({consistencyWord(stats.stdev)})
			</span>
			<span className="text-muted-foreground">{stats.count} tentativi</span>
		</div>
	);
}

export function AccuracyTrend({ attempts }: { attempts: TrendAttempt[] }) {
	const [mode, setMode] = useState<ModeFilter>("confronto");

	const { points, granularity, stats } = useMemo(() => {
		const scoped =
			mode === "confronto"
				? attempts
				: attempts.filter(attempt => attempt.quizMode === mode);
		const { granularity, points } = buildTrendSeries(scoped);
		const stats = computeTrendStats(
			[...scoped]
				.sort((a, b) => a.completedAt.localeCompare(b.completedAt))
				.map(attempt => attempt.score)
		);
		return { points, granularity, stats };
	}, [attempts, mode]);

	return (
		<TimeSeriesChart
			title="Andamento"
			description="Voto medio nel tempo"
			variant="area"
			connectNulls
			data={points}
			xKey="bucket"
			series={SERIES[mode]}
			yDomain={[0, 33]}
			valueFormatter={formatThirtyScaleGrade}
			xFormatter={value => formatBucketLabel(String(value), granularity)}
			emptyMessage="Nessun tentativo in questo intervallo."
			actions={
				<div className="bg-muted/50 flex gap-0.5 rounded-lg p-0.5">
					{MODE_TABS.map(tab => (
						<Button
							key={tab.value}
							variant={mode === tab.value ? "secondary" : "ghost"}
							size="sm"
							className={cn("h-7 px-2.5 text-xs", mode === tab.value && "shadow-sm")}
							onClick={() => setMode(tab.value)}
						>
							{tab.label}
						</Button>
					))}
				</div>
			}
			footer={<TrendFooter stats={stats} />}
		/>
	);
}

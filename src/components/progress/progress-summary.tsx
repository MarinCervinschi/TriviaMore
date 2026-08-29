import { useState } from "react";

import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { CardContent, CardHeader, CardTexture, CardTitle } from "@/components/ui/card";
import { InsetCard } from "@/components/ui/inset-card";
import {
	type SummaryMetric,
	type SummaryPeriod,
	buildStudySummary,
} from "@/lib/user/study-summary";
import type { DailyStudyStat } from "@/lib/user/types";
import { cn } from "@/lib/utils";

const META: Record<SummaryMetric["key"], { icon: Icon; label: string }> = {
	quizzes: { icon: CupFirstIcon, label: "Quiz completati" },
	grade: { icon: GraphUpIcon, label: "Media voto" },
	accuracy: { icon: CheckCircleIcon, label: "Accuratezza" },
	time: { icon: ClockCircleIcon, label: "Tempo di studio" },
};

const PERIODS: { value: SummaryPeriod; label: string }[] = [
	{ value: "week", label: "Settimana" },
	{ value: "month", label: "Mese" },
	{ value: "year", label: "Anno" },
];

function note(delta: number) {
	if (delta > 2) return "In crescita";
	if (delta < -2) return "In calo";
	return "Stabile";
}

function Sparkline({ points }: { points: (number | null)[] }) {
	const w = 96;
	const h = 28;
	const pad = 2;
	// A gap keeps its place on the x axis: the point is dropped, its slot is not.
	const drawn = points.flatMap((p, i) => (p === null ? [] : [{ value: p, i }]));
	if (drawn.length < 2) return null;
	const values = drawn.map(point => point.value);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
	const d = drawn
		.map(
			({ value, i }) =>
				`${pad + i * step},${pad + (h - pad * 2) * (1 - (value - min) / range)}`
		)
		.join(" ");
	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			fill="none"
			className="text-muted-foreground/60 shrink-0"
			aria-hidden
		>
			<polyline
				points={d}
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function Tile({ metric }: { metric: SummaryMetric }) {
	const { icon: Icon, label } = META[metric.key];
	return (
		<div className="space-y-2 md:px-4 md:first:pl-0 md:last:pr-0">
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<Icon className="h-4 w-4" />
				{label}
			</div>
			<div className="flex items-center justify-between gap-2">
				<span className="text-xl font-bold tabular-nums">{metric.value}</span>
				<span className="hidden sm:block">
					<Sparkline points={metric.spark} />
				</span>
			</div>
			{metric.delta !== null && (
				<div className="flex items-center gap-2">
					<DeltaBadge value={metric.delta} />
					<span className="text-muted-foreground text-xs">{note(metric.delta)}</span>
				</div>
			)}
		</div>
	);
}

export function ProgressSummary({
	daily,
	today,
}: {
	daily: DailyStudyStat[];
	/** Injected in stories to keep them deterministic; the app uses now. */
	today?: Date;
}) {
	const [period, setPeriod] = useState<SummaryPeriod>("week");
	const summary = buildStudySummary(daily, period, today ?? new Date());

	return (
		<InsetCard
			panelClassName="relative"
			footer={
				<div className="text-muted-foreground flex flex-col items-start gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
					<span>{summary.footer}</span>
					<Link
						to="/user/analytics"
						className="group text-foreground inline-flex items-center gap-1 font-medium hover:underline"
					>
						Analisi complete
						<AltArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			}
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-36">
				<CardTexture placement="top" alpha={0.2} />
			</div>
			<CardHeader className="relative pb-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div>
						<CardTitle className="text-sm">I miei progressi</CardTitle>
						<p className="text-muted-foreground mt-0.5 text-sm">
							Colpo d'occhio su quiz, voto e costanza.
						</p>
					</div>
					<div className="bg-muted/50 flex gap-0.5 rounded-lg p-0.5">
						{PERIODS.map(p => (
							<button
								key={p.value}
								type="button"
								onClick={() => setPeriod(p.value)}
								className={cn(
									"rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
									period === p.value
										? "bg-background shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{p.label}
							</button>
						))}
					</div>
				</div>
			</CardHeader>
			<CardContent className="relative">
				<div className="divide-border/60 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-y-0 md:divide-x">
					{summary.metrics.map(metric => (
						<Tile key={metric.key} metric={metric} />
					))}
				</div>
			</CardContent>
		</InsetCard>
	);
}

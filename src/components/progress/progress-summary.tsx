import { useState } from "react";

import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import {
	Card,
	CardContent,
	CardHeader,
	CardTexture,
	CardTitle,
} from "@/components/ui/card";
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

function Sparkline({ points }: { points: number[] }) {
	const w = 96;
	const h = 28;
	const pad = 2;
	const min = Math.min(...points);
	const max = Math.max(...points);
	const range = max - min || 1;
	const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
	const d = points
		.map((p, i) => `${pad + i * step},${pad + (h - pad * 2) * (1 - (p - min) / range)}`)
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

function DeltaBadge({ delta }: { delta: number }) {
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

function Tile({ metric }: { metric: SummaryMetric }) {
	const { icon: Icon, label } = META[metric.key];
	return (
		<div className="space-y-2 md:px-4 md:first:pl-0 md:last:pr-0">
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<Icon className="h-4 w-4" />
				{label}
			</div>
			<div className="flex items-center justify-between gap-2">
				<span className="text-2xl font-bold tabular-nums sm:text-3xl">
					{metric.value}
				</span>
				<span className="hidden sm:block">
					<Sparkline points={metric.spark} />
				</span>
			</div>
			{metric.delta !== null && (
				<div className="flex items-center gap-2">
					<DeltaBadge delta={metric.delta} />
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
		<Card className="bg-muted/30 relative overflow-hidden p-1">
			{/* Everything above the muted footer lives in one framed, textured panel. */}
			<div className="bg-card relative overflow-hidden rounded-xl border">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-36">
					<CardTexture placement="top" alpha={0.2} />
				</div>
				<CardHeader className="relative pb-2">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
						<div>
							<CardTitle className="text-base">I miei progressi</CardTitle>
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
										"rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
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
			</div>
			<Link
				to="/user/progress"
				className="group hover:bg-muted/60 text-muted-foreground flex flex-col items-start gap-1 px-4 py-2.5 text-sm transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-2"
			>
				<span>{summary.footer}</span>
				<span className="text-foreground inline-flex items-center gap-1 font-medium group-hover:underline">
					Analisi complete
					<AltArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</span>
			</Link>
		</Card>
	);
}

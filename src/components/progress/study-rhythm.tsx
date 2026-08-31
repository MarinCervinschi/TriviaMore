import { useMemo } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { TargetIcon } from "@solar-icons/react/linear/target";

import { ChartCard } from "@/components/charts";
import type { Icon } from "@/components/icons";
import { IconTile } from "@/components/ui/icon-tile";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { type StudyRhythm as Rhythm, computeStudyRhythm } from "@/lib/user/rhythm";
import type { AttemptHistoryEntry } from "@/lib/user/types";
import { cn } from "@/lib/utils";

/** Shape only, for the render before hydration — every figure reads as a dash. */
const PENDING: Rhythm = {
	currentStreak: 0,
	longestStreak: 0,
	activeDays: 0,
	windowDays: 30,
	byHour: new Array<number>(24).fill(0),
	peakHour: null,
	consistency: { mean: 0, stdev: 0, count: 0, thin: true },
};

function HourBars({ byHour, peakHour }: { byHour: number[]; peakHour: number | null }) {
	const max = Math.max(1, ...byHour);
	return (
		<div className="space-y-2">
			<TooltipProvider delayDuration={80}>
				<div className="flex h-12 items-end gap-px">
					{byHour.map((count, hour) => (
						<Tooltip key={hour}>
							<TooltipTrigger asChild>
								<div className="flex h-full flex-1 items-end">
									<div
										className={cn(
											"w-full rounded-sm",
											hour === peakHour ? "bg-primary" : "bg-muted"
										)}
										style={{ height: `${Math.max(6, (count / max) * 100)}%` }}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent className="tabular-nums">
								{String(hour).padStart(2, "0")}:00 · {count} quiz
							</TooltipContent>
						</Tooltip>
					))}
				</div>
			</TooltipProvider>
			<div className="text-muted-foreground text-2xs flex justify-between">
				<span>00</span>
				<span>06</span>
				<span>12</span>
				<span>18</span>
				<span>23</span>
			</div>
		</div>
	);
}

/**
 * The hour histogram on its own, for the analytics grid: when you study, plus the
 * two figures that qualify it — the peak hour and how much your grades scatter.
 * Both are read in the **viewer's** timezone, which the server does not share, so
 * they only appear once hydrated.
 */
export function WhenYouStudyCard({
	attempts,
	today,
}: {
	attempts: AttemptHistoryEntry[];
	today?: Date;
}) {
	const hydrated = useIsHydrated();
	const now = useMemo(() => today ?? new Date(), [today]);
	const rhythm = useMemo(
		() => (hydrated ? computeStudyRhythm(attempts, now) : null),
		[hydrated, attempts, now]
	);
	const shown = rhythm ?? PENDING;

	return (
		<ChartCard
			title="Quando studi"
			description="Quiz completati per ora del giorno"
			texture="top"
			className="h-full"
		>
			<HourBars byHour={shown.byHour} peakHour={shown.peakHour} />
			<div className="flex flex-col gap-3">
				<RhythmFigure
					icon={ClockCircleIcon}
					label="Ora di punta"
					value={rhythm && shown.peakHour !== null ? `${shown.peakHour}:00` : "—"}
					hint={
						rhythm && shown.peakHour !== null
							? "l'ora in cui chiudi più quiz"
							: undefined
					}
				/>
				<RhythmFigure
					icon={TargetIcon}
					label="Costanza dei voti"
					value={
						shown.consistency.thin ? "—" : `±${shown.consistency.stdev.toFixed(1)}`
					}
					hint={
						shown.consistency.thin
							? "servono almeno tre quiz"
							: `sugli ultimi ${shown.consistency.count} quiz`
					}
				/>
			</div>
		</ChartCard>
	);
}

function RhythmFigure({
	icon: LeadIcon,
	label,
	value,
	hint,
}: {
	icon: Icon;
	label: string;
	value: string;
	hint?: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<IconTile variant="soft" size="sm" className="text-muted-foreground">
				<LeadIcon />
			</IconTile>
			<div className="min-w-0">
				<p className="text-muted-foreground text-sm">{label}</p>
				<p className="text-xl font-bold tabular-nums">{value}</p>
			</div>
			{hint && (
				<p className="text-muted-foreground ml-auto text-right text-xs">{hint}</p>
			)}
		</div>
	);
}

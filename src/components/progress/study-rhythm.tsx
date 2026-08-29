import { useMemo } from "react";

import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { FireMinimalisticIcon } from "@solar-icons/react/linear/fire-minimalistic";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { TargetIcon } from "@solar-icons/react/linear/target";

import { ChartCard } from "@/components/charts";
import type { Icon } from "@/components/icons";
import { CardTexture } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";
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

function plural(n: number, one: string, many: string): string {
	return n === 1 ? one : many;
}

function Stat({
	icon: LeadIcon,
	value,
	label,
	hint,
	tone,
}: {
	icon: Icon;
	value: string;
	label: string;
	hint?: string;
	tone?: string;
}) {
	return (
		<div className="flex flex-col gap-1 p-4">
			<span className="text-muted-foreground flex items-center gap-1.5 text-sm">
				<LeadIcon className="size-4" />
				{label}
			</span>
			<span className={cn("text-2xl font-bold tabular-nums", tone)}>{value}</span>
			{hint && <span className="text-muted-foreground text-xs">{hint}</span>}
		</div>
	);
}

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

function RhythmPanel({ rhythm }: { rhythm: Rhythm | null }) {
	const shown = rhythm ?? PENDING;
	const { currentStreak, longestStreak, activeDays, windowDays, consistency } = shown;
	const dash = (value: string) => (rhythm ? value : "—");
	return (
		<InsetCard className="h-full" panelClassName="relative h-full">
			<CardTexture placement="top" alpha={0.2} />
			<div className="relative grid grid-cols-2 divide-x divide-y md:grid-cols-4 md:divide-y-0">
				<Stat
					icon={FireMinimalisticIcon}
					value={dash(String(currentStreak))}
					label="Serie attuale"
					hint={`${plural(currentStreak, "giorno", "giorni")} di fila`}
					tone={rhythm && currentStreak > 0 ? "text-warning" : undefined}
				/>
				<Stat
					icon={CalendarMinimalisticIcon}
					value={dash(String(activeDays))}
					label="Giorni attivi"
					hint={`ultimi ${windowDays} giorni`}
				/>
				<Stat
					icon={GraphUpIcon}
					value={dash(String(longestStreak))}
					label="Serie record"
					hint={`${plural(longestStreak, "giorno", "giorni")} di fila`}
				/>
				<Stat
					icon={TargetIcon}
					value={consistency.thin ? "—" : `±${consistency.stdev.toFixed(1)}`}
					label="Costanza voti"
					hint={consistency.thin ? "pochi dati" : `su ${consistency.count} quiz`}
				/>
			</div>
			<div className="relative flex flex-1 flex-col justify-end border-t">
				<div className="space-y-2 p-4">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Quando studi</span>
						{shown.peakHour !== null && (
							<span className="text-muted-foreground text-xs">
								Più attivo verso le{" "}
								<span className="text-foreground font-medium tabular-nums">
									{shown.peakHour}:00
								</span>
							</span>
						)}
					</div>
					<HourBars byHour={shown.byHour} peakHour={shown.peakHour} />
				</div>
			</div>
		</InsetCard>
	);
}

/**
 * Study rhythm, derived from the attempt history the page already loaded.
 *
 * Streaks and the hour histogram are read in the **viewer's** timezone, which
 * the server does not share, so the figures only appear once hydrated — until
 * then the panel renders its own shape with dashes. `today` is injected in
 * stories for determinism.
 */
export function StudyRhythm({
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

	return (
		<div className="space-y-3">
			<h2 className="text-lg font-semibold">Ritmo di studio</h2>
			<RhythmPanel rhythm={rhythm} />
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

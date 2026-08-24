import { useMemo } from "react";

import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { FireMinimalisticIcon } from "@solar-icons/react/linear/fire-minimalistic";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { TargetIcon } from "@solar-icons/react/linear/target";

import type { Icon } from "@/components/icons";
import { Card, CardTexture } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type StudyRhythm as Rhythm, computeStudyRhythm } from "@/lib/user/rhythm";
import type { AttemptHistoryEntry } from "@/lib/user/types";
import { cn } from "@/lib/utils";

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

function WhenYouStudy({
	byHour,
	peakHour,
}: {
	byHour: number[];
	peakHour: number | null;
}) {
	const max = Math.max(1, ...byHour);
	return (
		<div className="space-y-2 p-4">
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-sm">Quando studi</span>
				{peakHour !== null && (
					<span className="text-muted-foreground text-xs">
						Più attivo verso le{" "}
						<span className="text-foreground font-medium tabular-nums">
							{peakHour}:00
						</span>
					</span>
				)}
			</div>
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

function RhythmPanel({ rhythm }: { rhythm: Rhythm }) {
	const { currentStreak, longestStreak, activeDays, windowDays, consistency } = rhythm;
	return (
		<Card className="bg-muted/30 h-full overflow-hidden p-1">
			<div className="bg-card relative flex h-full flex-col overflow-hidden rounded-xl border">
				<CardTexture placement="top" alpha={0.2} />
				<div className="relative grid grid-cols-2 divide-x divide-y md:grid-cols-4 md:divide-y-0">
					<Stat
						icon={FireMinimalisticIcon}
						value={String(currentStreak)}
						label="Serie attuale"
						hint={`${plural(currentStreak, "giorno", "giorni")} di fila`}
						tone={currentStreak > 0 ? "text-warning" : undefined}
					/>
					<Stat
						icon={CalendarMinimalisticIcon}
						value={String(activeDays)}
						label="Giorni attivi"
						hint={`ultimi ${windowDays} giorni`}
					/>
					<Stat
						icon={GraphUpIcon}
						value={String(longestStreak)}
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
					<WhenYouStudy byHour={rhythm.byHour} peakHour={rhythm.peakHour} />
				</div>
			</div>
		</Card>
	);
}

/**
 * Study rhythm, derived client-side from the attempt history already loaded by
 * the hub. `today` is injected in stories for determinism.
 */
export function StudyRhythm({
	attempts,
	today,
}: {
	attempts: AttemptHistoryEntry[];
	today?: Date;
}) {
	const now = useMemo(() => today ?? new Date(), [today]);
	const rhythm = useMemo(() => computeStudyRhythm(attempts, now), [attempts, now]);

	return (
		<div className="space-y-3">
			<h2 className="text-lg font-semibold">Ritmo di studio</h2>
			<RhythmPanel rhythm={rhythm} />
		</div>
	);
}

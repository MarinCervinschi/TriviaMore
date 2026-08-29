import { useMemo, useState } from "react";

import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { FireMinimalisticIcon } from "@solar-icons/react/linear/fire-minimalistic";
import { FlagIcon } from "@solar-icons/react/linear/flag";

import {
	type CalendarDatum,
	CalendarHeatmap,
	ChartCard,
	type HeatmapView,
	heatmapYears,
} from "@/components/charts";
import type { Icon } from "@/components/icons";
import { type ChipOption, SelectChip } from "@/components/shared/select-chip";
import { IconTile } from "@/components/ui/icon-tile";
import { Separator } from "@/components/ui/separator";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { computeStudyRhythm } from "@/lib/user/rhythm";
import type { AttemptHistoryEntry, DailyStudyStat } from "@/lib/user/types";
import { cn } from "@/lib/utils";

/** One square per day, both modes summed: the heatmap counts sittings, not marks. */
function toCalendar(daily: DailyStudyStat[]): CalendarDatum[] {
	const perDay = new Map<string, number>();
	for (const row of daily) {
		perDay.set(row.date, (perDay.get(row.date) ?? 0) + row.quizzes);
	}
	return [...perDay.entries()]
		.map(([date, value]) => ({ date, value }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function Figure({
	icon: LeadIcon,
	label,
	value,
	hint,
	tone,
}: {
	icon: Icon;
	label: string;
	value: string;
	hint?: string;
	tone?: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<IconTile variant="soft" size="sm" className={tone ?? "text-muted-foreground"}>
				<LeadIcon />
			</IconTile>
			<div className="min-w-0">
				<p className="text-muted-foreground truncate text-sm">{label}</p>
				<p className={cn("text-xl font-bold tabular-nums", tone)}>{value}</p>
				{hint && <p className="text-muted-foreground truncate text-xs">{hint}</p>}
			</div>
		</div>
	);
}

/**
 * How regularly you study: the streaks, and a square per day of the year. The
 * squares come from the daily stats, which are keyed in UTC by the server, so the
 * calendar is the same everywhere; the streaks are counted in the **viewer's**
 * day and therefore wait for hydration, showing dashes until then.
 */
export function ConsistencyCard({
	daily,
	attempts,
	today,
}: {
	daily: DailyStudyStat[];
	attempts: AttemptHistoryEntry[];
	today?: Date;
}) {
	const hydrated = useIsHydrated();
	const now = useMemo(() => today ?? new Date(), [today]);
	const rhythm = useMemo(
		() => (hydrated ? computeStudyRhythm(attempts, now) : null),
		[hydrated, attempts, now]
	);
	const data = useMemo(() => toCalendar(daily), [daily]);

	// The chip speaks strings (a radio group's value is one); the heatmap's own
	// view type carries the year as a number, so it is parsed back on the way out.
	const [view, setView] = useState("rolling");
	const views: ChipOption<string>[] = [
		{ value: "rolling", label: "12 mesi" },
		...heatmapYears(data).map(year => ({ value: String(year), label: String(year) })),
	];
	const heatmapView: HeatmapView = view === "rolling" ? "rolling" : Number(view);

	const dash = (value: string) => (rhythm ? value : "—");
	const days = (n: number) => `${n === 1 ? "giorno" : "giorni"} di fila`;

	return (
		<ChartCard
			title="Costanza"
			description="Un quadretto per giorno, più intenso dove hai fatto più quiz"
			texture="top"
			className="h-full"
			actions={
				views.length > 1 && (
					<SelectChip
						label="Periodo"
						value={view}
						onChange={setView}
						options={views}
						lead={CalendarMinimalisticIcon}
					/>
				)
			}
		>
			<div className="grid gap-4 sm:grid-cols-3">
				<Figure
					icon={FireMinimalisticIcon}
					label="Serie attuale"
					value={dash(String(rhythm?.currentStreak ?? 0))}
					hint={rhythm ? days(rhythm.currentStreak) : undefined}
					tone={rhythm && rhythm.currentStreak > 0 ? "text-warning" : undefined}
				/>
				<Figure
					icon={CalendarMinimalisticIcon}
					label="Giorni attivi"
					value={dash(`${rhythm?.activeDays ?? 0} / ${rhythm?.windowDays ?? 30}`)}
					hint={rhythm ? `ultimi ${rhythm.windowDays} giorni` : undefined}
				/>
				<Figure
					icon={FlagIcon}
					label="Serie record"
					value={dash(String(rhythm?.longestStreak ?? 0))}
					hint={rhythm ? days(rhythm.longestStreak) : undefined}
				/>
			</div>

			<Separator />

			<CalendarHeatmap
				data={data}
				view={heatmapView}
				frame={false}
				emptyMessage="Completa il tuo primo quiz per iniziare a tracciare la costanza."
			/>
		</ChartCard>
	);
}

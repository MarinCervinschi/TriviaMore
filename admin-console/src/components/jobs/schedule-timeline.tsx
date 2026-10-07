import { Link } from "@tanstack/react-router";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { StatusBadge } from "~/components/status-badge";
import { formatDateTime } from "~/lib/format";
import type {
	JobInfo,
	JobRunStatus,
	SchedulerOverview,
	TimelineWindow,
} from "~/lib/jobs/types";

import { RUN_STATUS } from "./run-status-badge";

const HOUR_MS = 60 * 60 * 1000;

const DOT: Record<JobRunStatus, string> = {
	SUCCEEDED: "bg-success",
	FAILED: "bg-danger",
	RUNNING: "bg-info",
	QUEUED: "bg-muted-foreground",
	CANCELLED: "bg-muted-foreground",
};

// A fixed time zone, so the server and the browser draw the same axis.
const ROME_HOUR = new Intl.DateTimeFormat("it-IT", {
	timeZone: "Europe/Rome",
	hour: "2-digit",
	hourCycle: "h23",
});
const TICK_TIME = new Intl.DateTimeFormat("it-IT", {
	timeZone: "Europe/Rome",
	hour: "2-digit",
	minute: "2-digit",
});
const TICK_DAY = new Intl.DateTimeFormat("it-IT", {
	timeZone: "Europe/Rome",
	weekday: "short",
	day: "numeric",
});

// Marks this close to an edge or to "adesso", as a share of the axis, would overlap it; day labels are wider.
const TICK_CLEARANCE: Record<TimelineWindow, number> = { day: 0.035, week: 0.07 };

/** Hour marks every three hours over a day, midnights over a week, both on Rome's clock. */
function ticks(start: number, end: number, now: number, window: TimelineWindow) {
	const first = Math.ceil(start / HOUR_MS) * HOUR_MS;
	const marks: { at: number; label: string }[] = [];
	for (let at = first; at <= end; at += HOUR_MS) {
		const hour = Number(ROME_HOUR.format(at));
		const share = (at - start) / (end - start);
		const clear =
			share > TICK_CLEARANCE[window] &&
			share < 1 - TICK_CLEARANCE[window] &&
			Math.abs(share - (now - start) / (end - start)) > TICK_CLEARANCE[window];
		if (clear && (window === "day" ? hour % 3 === 0 : hour === 0)) {
			marks.push({
				at,
				label: window === "day" ? TICK_TIME.format(at) : TICK_DAY.format(at),
			});
		}
	}
	return marks;
}

export function ScheduleTimeline({
	overview,
	jobs,
	window,
	onOpenSchedule,
}: {
	overview: SchedulerOverview;
	jobs: JobInfo[];
	window: TimelineWindow;
	onOpenSchedule: (key: string) => void;
}) {
	const start = Date.parse(overview.start);
	const end = Date.parse(overview.end);
	const position = (iso: string) =>
		`${(((Date.parse(iso) - start) / (end - start)) * 100).toFixed(3)}%`;
	const now = position(overview.now);
	const labelOf = new Map(jobs.map(job => [job.name, job.label]));

	if (overview.rows.length === 0) {
		return (
			<p className="text-muted-foreground px-4 py-8 text-center text-sm">
				Nessuna pianificazione da mostrare.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto">
			<div className="min-w-[44rem]">
				<div className="grid grid-cols-[14rem_1fr] border-b">
					<div />
					<div className="relative h-8">
						{ticks(start, end, Date.parse(overview.now), window).map(tick => (
							<span
								key={tick.at}
								className="text-muted-foreground absolute top-2 -translate-x-1/2 font-mono text-[11px] tabular-nums"
								style={{ left: position(new Date(tick.at).toISOString()) }}
							>
								{tick.label}
							</span>
						))}
						<span
							className="text-info absolute top-2 -translate-x-1/2 text-[11px] font-medium"
							style={{ left: now }}
						>
							adesso
						</span>
					</div>
				</div>

				<ul className="divide-y">
					{overview.rows.map(row => (
						<li key={row.schedule.key} className="grid grid-cols-[14rem_1fr]">
							<button
								type="button"
								onClick={() => onOpenSchedule(row.schedule.key)}
								className="hover:bg-muted/40 focus-visible:ring-ring min-w-0 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset motion-reduce:transition-none"
							>
								<span className="flex items-center gap-2">
									<span className="truncate text-sm font-medium">
										{labelOf.get(row.schedule.job) ?? row.schedule.job}
									</span>
									{row.schedule.paused && (
										<StatusBadge status="neutral">In pausa</StatusBadge>
									)}
								</span>
								<span className="text-muted-foreground block truncate text-xs">
									{row.schedule.description}
									{row.schedule.dryRun ? " · simulazione" : ""}
								</span>
							</button>

							<div
								className={cn(
									"relative overflow-hidden",
									row.schedule.paused && "opacity-50"
								)}
							>
								<span
									aria-hidden
									className="bg-border absolute inset-x-0 top-1/2 h-px"
								/>
								<span
									aria-hidden
									className="bg-info/60 absolute inset-y-0 w-px"
									style={{ left: now }}
								/>

								{row.upcoming.map(at => (
									<span
										key={at}
										aria-hidden
										title={`Prevista il ${formatDateTime(at)}`}
										className="border-foreground/50 bg-card absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border"
										style={{ left: position(at) }}
									/>
								))}

								{row.past.map(run => (
									<Tooltip key={run.id}>
										<TooltipTrigger asChild>
											<Link
												to="/jobs"
												search={{ detail: run.id }}
												aria-label={`${RUN_STATUS[run.status].label}, ${formatDateTime(run.queuedAt)}`}
												className={cn(
													"focus-visible:ring-ring ring-card absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 outline-none focus-visible:ring-2",
													DOT[run.status]
												)}
												style={{ left: position(run.queuedAt) }}
											/>
										</TooltipTrigger>
										<TooltipContent>
											{RUN_STATUS[run.status].label} · {formatDateTime(run.queuedAt)}
										</TooltipContent>
									</Tooltip>
								))}

								<span className="sr-only">
									{row.upcoming[0]
										? `Prossima il ${formatDateTime(row.upcoming[0])}, ${row.upcoming.length} nella finestra.`
										: "Nessuna esecuzione prevista nella finestra."}
								</span>
								{row.past.length === 0 && row.upcoming.length === 0 && (
									<span className="text-muted-foreground bg-card absolute top-1/2 left-3 -translate-y-1/2 pr-2 text-xs">
										{row.schedule.paused
											? "In pausa: nessuna esecuzione prevista"
											: row.schedule.nextRun
												? `Prossima fuori dalla finestra, il ${formatDateTime(row.schedule.nextRun)}`
												: "Nessuna esecuzione prevista"}
									</span>
								)}
								{row.truncated && (
									<span className="text-muted-foreground bg-card absolute right-2 bottom-1 text-[11px]">
										e altre
									</span>
								)}
							</div>
						</li>
					))}
				</ul>

				<div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs">
					{(["SUCCEEDED", "FAILED", "RUNNING"] as const).map(status => (
						<span key={status} className="inline-flex items-center gap-1.5">
							<span className={cn("size-2.5 rounded-full", DOT[status])} />
							{RUN_STATUS[status].label}
						</span>
					))}
					<span className="inline-flex items-center gap-1.5">
						<span className="border-foreground/50 size-2.5 rounded-full border" />
						Prevista
					</span>
				</div>
			</div>
		</div>
	);
}

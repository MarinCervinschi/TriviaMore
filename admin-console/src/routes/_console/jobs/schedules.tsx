import { useMemo, useState } from "react";

import { PauseIcon } from "@solar-icons/react/linear/pause";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import {
	DataTable,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { PlusGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { ConsolePage } from "~/components/console-page";
import { FigureCard } from "~/components/figure-card";
import { RunStatusBadge } from "~/components/jobs/run-status-badge";
import { ScheduleSheet } from "~/components/jobs/schedule-sheet";
import { ScheduleTimeline } from "~/components/jobs/schedule-timeline";
import { WorkerBar } from "~/components/jobs/worker-status";
import { formatDateTime, formatNumber, formatRelativeFuture } from "~/lib/format";
import { setSchedulePausedFn } from "~/lib/jobs/api";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobSchedule, TimelineWindow } from "~/lib/jobs/types";

export const Route = createFileRoute("/_console/jobs/schedules")({
	validateSearch: z.object({
		detail: z.string().optional().catch(undefined),
		finestra: z.enum(["day", "week"]).optional().catch(undefined),
	}),
	loaderDeps: ({ search }) => ({ window: search.finestra ?? "day" }),
	loader: ({ context, deps }) =>
		Promise.all([
			context.queryClient.ensureQueryData(jobQueries.jobs()),
			context.queryClient.ensureQueryData(jobQueries.overview(deps.window)),
		]),
	component: SchedulesPage,
});

const WINDOW_LABELS: Record<TimelineWindow, string> = {
	day: "24 ore",
	week: "7 giorni",
};

const column = createDataTableColumns<JobSchedule>();

function buildColumns(
	labelOf: Map<string, string>,
	onTogglePause: (schedule: JobSchedule) => void
) {
	return [
		column.accessor("job", {
			header: "Job",
			meta: { label: "Job", cellClassName: "min-w-[12rem]" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-medium">
						{labelOf.get(row.original.job) ?? row.original.job}
					</p>
					<p className="text-muted-foreground text-xs">
						{row.original.dryRun ? "Simulazione" : "Applica"}
					</p>
				</div>
			),
		}),
		column.accessor("description", {
			header: "Frequenza",
			meta: { label: "Frequenza" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate">{row.original.description}</p>
					<p className="text-muted-foreground font-mono text-xs">{row.original.cron}</p>
				</div>
			),
		}),
		column.accessor("nextRun", {
			header: "Prossima",
			meta: { label: "Prossima", align: "right", hideBelow: "sm" },
			cell: ({ row }) => (
				<span className="text-xs whitespace-nowrap">
					{row.original.paused ? "In pausa" : formatDateTime(row.original.nextRun)}
				</span>
			),
		}),
		column.display({
			id: "lastRun",
			header: "Ultima",
			meta: { label: "Ultima", align: "right", hideBelow: "md" },
			cell: ({ row }) => {
				const last = row.original.lastRun;
				if (!last) return <span className="text-muted-foreground text-xs">Mai</span>;
				return (
					<Link
						to="/jobs"
						search={{ detail: last.id }}
						className="inline-flex items-center gap-2"
						aria-label={`Apri l'ultima esecuzione, ${formatDateTime(last.queuedAt)}`}
					>
						<span className="text-muted-foreground text-xs whitespace-nowrap">
							{formatDateTime(last.queuedAt)}
						</span>
						<RunStatusBadge status={last.status} />
					</Link>
				);
			},
		}),
		column.display({
			id: "active",
			header: "Attiva",
			enableHiding: false,
			enableResizing: false,
			meta: { label: "Attiva", align: "right" },
			cell: ({ row }) => (
				<Switch
					checked={!row.original.paused}
					onCheckedChange={() => onTogglePause(row.original)}
					aria-label={`${row.original.paused ? "Riprendi" : "Metti in pausa"} ${row.original.description}`}
				/>
			),
		}),
	];
}

function SchedulesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { detail, finestra } = Route.useSearch();
	const window: TimelineWindow = finestra ?? "day";
	const queryClient = useQueryClient();
	const { data: jobs } = useSuspenseQuery(jobQueries.jobs());
	const { data: overview } = useSuspenseQuery(jobQueries.overview(window));
	const [creating, setCreating] = useState(false);

	const schedules = useMemo(() => overview.rows.map(row => row.schedule), [overview]);
	const editing = schedules.find(schedule => schedule.key === detail);
	const labelOf = useMemo(
		() => new Map(jobs.map(job => [job.name, job.label])),
		[jobs]
	);

	const openDetail = (key: string | undefined) =>
		navigate({ search: prev => ({ ...prev, detail: key }), resetScroll: false });

	const pause = useMutation({
		mutationFn: (input: { key: string | "all"; paused: boolean }) =>
			setSchedulePausedFn({ data: input }),
		onSuccess: (result, input) => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "schedules"] });
			toast.success(
				input.key === "all"
					? input.paused
						? "Tutte le pianificazioni sono in pausa."
						: "Tutte le pianificazioni sono riprese."
					: input.paused
						? "Pianificazione in pausa. I job che aveva accodato sono stati tolti."
						: "Pianificazione ripresa."
			);
		},
		onError: () => toast.error("Non è stato possibile cambiare la pausa."),
	});

	const togglePause = pause.mutate;
	const columns = useMemo(
		() =>
			buildColumns(labelOf, schedule =>
				togglePause({ key: schedule.key, paused: !schedule.paused })
			),
		[labelOf, togglePause]
	);

	const table = useDataTable({
		data: schedules,
		columns,
		getRowId: row => row.key,
		resizableColumns: true,
		pageSize: Math.max(schedules.length, 1),
	});

	const { counts, next } = overview;
	const active = counts.schedules - counts.paused;

	return (
		<ConsolePage
			title="Pianificazioni"
			description="Quando il worker accoda ogni job da solo. Le esecuzioni compaiono in Esecuzioni, con origine «Pianificazione»."
			actions={
				<Button size="sm" onClick={() => setCreating(true)}>
					<PlusGlyph className="size-4" />
					Nuova pianificazione
				</Button>
			}
		>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<FigureCard
					label="Pianificazioni"
					value={formatNumber(counts.schedules)}
					hint={counts.paused > 0 ? `${counts.paused} in pausa` : "tutte attive"}
				/>
				<FigureCard
					label="In corso adesso"
					value={formatNumber(counts.running)}
					hint="esecuzioni, manuali o pianificate"
				/>
				<FigureCard
					label="Fallite nelle ultime 24 ore"
					value={formatNumber(counts.failedLastDay)}
					hint="esecuzioni, manuali o pianificate"
				/>
				<FigureCard
					label="Prossima esecuzione"
					value={next ? formatRelativeFuture(overview.now, next.at) : "—"}
					hint={
						next
							? `${labelOf.get(next.job) ?? next.job} · ${formatDateTime(next.at)}`
							: "nessuna pianificazione attiva"
					}
				/>
			</div>

			<WorkerBar>
				<Button
					size="sm"
					variant="outline"
					disabled={active === 0 || pause.isPending}
					onClick={() => pause.mutate({ key: "all", paused: true })}
				>
					<PauseIcon className="size-4" />
					Metti in pausa tutte
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={counts.paused === 0 || pause.isPending}
					onClick={() => pause.mutate({ key: "all", paused: false })}
				>
					<PlayIcon className="size-4" />
					Riprendi tutte
				</Button>
			</WorkerBar>

			<InsetCard
				title="Timeline"
				description="Le esecuzioni passate, colorate per esito, e le prossime previste. Clicca un pallino per aprire l'esecuzione."
				actions={
					<div
						role="radiogroup"
						aria-label="Finestra"
						className="bg-muted flex rounded-lg p-0.5"
					>
						{(Object.keys(WINDOW_LABELS) as TimelineWindow[]).map(option => (
							<button
								key={option}
								type="button"
								role="radio"
								aria-checked={window === option}
								onClick={() =>
									navigate({
										search: prev => ({
											...prev,
											finestra: option === "day" ? undefined : option,
										}),
										resetScroll: false,
									})
								}
								className={cn(
									"focus-visible:ring-ring rounded-md px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none",
									window === option
										? "bg-card text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{WINDOW_LABELS[option]}
							</button>
						))}
					</div>
				}
			>
				<ScheduleTimeline
					overview={overview}
					jobs={jobs}
					window={window}
					onOpenSchedule={openDetail}
				/>
			</InsetCard>

			<DataTable
				table={table}
				density="compact"
				showPagination={false}
				empty={
					<InlineEmpty>
						Nessuna pianificazione. I job partono solo quando li avvii da Esecuzioni.
					</InlineEmpty>
				}
				onRowClick={schedule => openDetail(schedule.key)}
				rowLink={schedule => (
					<Link
						from={Route.fullPath}
						to="."
						search={prev => ({ ...prev, detail: schedule.key })}
						resetScroll={false}
						aria-label={`Modifica la pianificazione ${schedule.description}`}
					/>
				)}
			/>

			<ScheduleSheet
				open={creating || Boolean(editing)}
				jobs={jobs}
				editing={editing}
				onClose={() => {
					setCreating(false);
					openDetail(undefined);
				}}
			/>
		</ConsolePage>
	);
}

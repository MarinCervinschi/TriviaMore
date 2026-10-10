import { useState } from "react";

import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { TabNav } from "@/components/ui/tab-nav";

import { ConsolePage } from "~/components/console-page";
import { JobTextsSheet } from "~/components/jobs/job-texts-sheet";
import { RunStatusBadge } from "~/components/jobs/run-status-badge";
import { RunsTable } from "~/components/jobs/runs-table";
import { ScheduleSheet } from "~/components/jobs/schedule-sheet";
import { StartPanel } from "~/components/jobs/start-panel";
import { NotFound } from "~/components/not-found";
import { StatusBadge } from "~/components/status-badge";
import { IS_PRODUCTION } from "~/lib/environment";
import { formatDateTime, formatDuration, formatNumber } from "~/lib/format";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobInfo, JobRun, JobSchedule } from "~/lib/jobs/types";

const TABS = ["panoramica", "esecuzioni", "pianificazioni"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/_console/jobs/$job/")({
	validateSearch: z.object({
		tab: z.enum(TABS).optional().catch(undefined),
		/** A queued run to change in the start panel. */
		edit: z.string().optional().catch(undefined),
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(jobQueries.jobs()),
			context.queryClient.ensureQueryData(jobQueries.runs()),
			context.queryClient.ensureQueryData(jobQueries.overview("week")),
		]),
	component: JobPage,
});

function JobPage() {
	const { job: name } = Route.useParams();
	const { data: jobs } = useSuspenseQuery(jobQueries.jobs());
	const job = jobs.find(entry => entry.name === name);
	if (!job) return <NotFound />;
	return <JobView job={job} jobs={jobs} />;
}

function JobView({ job, jobs }: { job: JobInfo; jobs: JobInfo[] }) {
	const navigate = useNavigate({ from: Route.fullPath });
	const { tab = "panoramica", edit } = Route.useSearch();
	const { data: allRuns } = useSuspenseQuery(jobQueries.runs());
	const { data: overview } = useSuspenseQuery(jobQueries.overview("week"));

	const runs = allRuns.filter(run => run.job === job.name);
	const schedules = overview.rows
		.map(row => row.schedule)
		.filter(s => s.job === job.name);
	const editing = edit
		? runs.find(run => run.id === edit && run.status === "QUEUED")
		: undefined;
	const lastSucceeded = runs.find(run => run.status === "SUCCEEDED");
	const openRun = (runId: string) =>
		navigate({ to: "/jobs/$job/runs/$runId", params: { job: job.name, runId } });

	const [editingTexts, setEditingTexts] = useState(false);
	const [schedule, setSchedule] = useState<{ editing?: JobSchedule } | null>(null);

	const select = (next: Tab) =>
		navigate({
			search: prev => ({ ...prev, tab: next === "panoramica" ? undefined : next }),
		});

	return (
		<ConsolePage
			back={{ to: "/jobs", label: "Job" }}
			title={job.label}
			description={job.description}
			actions={
				<Button size="sm" variant="outline" onClick={() => setEditingTexts(true)}>
					<Pen2Icon className="size-4" />
					Modifica
				</Button>
			}
		>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="min-w-0 space-y-4">
					<TabNav
						label="Sezioni del job"
						tabs={[
							{
								key: "panoramica",
								label: "Panoramica",
								active: tab === "panoramica",
								onSelect: () => select("panoramica"),
							},
							{
								key: "esecuzioni",
								label: "Esecuzioni",
								badge: runs.length > 0 ? formatNumber(runs.length) : undefined,
								active: tab === "esecuzioni",
								onSelect: () => select("esecuzioni"),
							},
							{
								key: "pianificazioni",
								label: "Pianificazioni",
								badge:
									schedules.length > 0 ? formatNumber(schedules.length) : undefined,
								active: tab === "pianificazioni",
								onSelect: () => select("pianificazioni"),
							},
						]}
					/>
					{tab === "panoramica" && (
						<Overview job={job} runs={runs} schedules={schedules} />
					)}
					{tab === "esecuzioni" && (
						<RunsTable runs={runs} jobs={jobs} showJob={false} />
					)}
					{tab === "pianificazioni" && (
						<Schedules
							schedules={schedules}
							onCreate={
								IS_PRODUCTION && job.simulates === false
									? undefined
									: () => setSchedule({})
							}
							onOpen={editing => setSchedule({ editing })}
						/>
					)}
				</div>

				<div className="lg:sticky lg:top-6">
					<StartPanel
						key={editing?.id ?? "new"}
						job={job}
						lastSucceeded={lastSucceeded}
						editing={editing}
						onDone={openRun}
						onCancelEdit={() =>
							navigate({ search: prev => ({ ...prev, edit: undefined }) })
						}
					/>
				</div>
			</div>

			<JobTextsSheet
				open={editingTexts}
				job={job}
				onClose={() => setEditingTexts(false)}
			/>
			<ScheduleSheet
				open={schedule !== null}
				jobs={jobs}
				job={job.name}
				editing={schedule?.editing}
				onClose={() => setSchedule(null)}
			/>
		</ConsolePage>
	);
}

function RunCard({ title, run, job }: { title: string; run: JobRun; job: JobInfo }) {
	const summary = Object.entries(run.summary ?? {});
	return (
		<InsetCard
			title={title}
			description={`${run.dryRun ? "Simulazione" : "Applicata"} · ${formatDateTime(run.queuedAt)}`}
			actions={<RunStatusBadge status={run.status} />}
			footer={
				<div className="flex justify-end">
					<Button asChild size="sm" variant="ghost" className="group">
						<Link to="/jobs/$job/runs/$runId" params={{ job: job.name, runId: run.id }}>
							Apri l'esecuzione
							<AltArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
						</Link>
					</Button>
				</div>
			}
		>
			<dl className="divide-y text-sm">
				{summary.map(([label, value]) => (
					<div key={label} className="flex justify-between gap-4 px-4 py-2">
						<dt className="text-muted-foreground">{label}</dt>
						<dd className="tabular-nums">
							{typeof value === "number" ? formatNumber(value) : value}
						</dd>
					</div>
				))}
				<div className="flex justify-between gap-4 px-4 py-2">
					<dt className="text-muted-foreground">Durata</dt>
					<dd className="tabular-nums">
						{formatDuration(run.startedAt, run.finishedAt)}
					</dd>
				</div>
			</dl>
			{run.error && (
				<p
					role="alert"
					className="text-danger border-t px-4 py-3 text-xs whitespace-pre-wrap"
				>
					{run.error}
				</p>
			)}
		</InsetCard>
	);
}

function Overview({
	job,
	runs,
	schedules,
}: {
	job: JobInfo;
	runs: JobRun[];
	schedules: JobSchedule[];
}) {
	const last = runs[0];
	const lastApplied = runs.find(run => !run.dryRun && run.status === "SUCCEEDED");
	const next = schedules
		.filter(schedule => !schedule.paused && schedule.nextRun)
		.sort((a, b) => a.nextRun!.localeCompare(b.nextRun!))[0];

	if (!last) {
		return (
			<InsetCard>
				<InlineEmpty>
					Non è mai stato eseguito. Avvialo dal pannello, partendo da una simulazione.
				</InlineEmpty>
			</InsetCard>
		);
	}

	return (
		<div className="grid gap-4 xl:grid-cols-2">
			<RunCard title="Ultima esecuzione" run={last} job={job} />
			{lastApplied && lastApplied.id !== last.id && (
				<RunCard title="Ultima applicata" run={lastApplied} job={job} />
			)}
			{next && (
				<InsetCard title="Prossima pianificata" description={next.description}>
					<p className="px-4 py-3 text-sm">
						{formatDateTime(next.nextRun)} · {next.dryRun ? "simulazione" : "applica"}
					</p>
				</InsetCard>
			)}
		</div>
	);
}

function Schedules({
	schedules,
	onCreate,
	onOpen,
}: {
	schedules: JobSchedule[];
	/** Missing for a job production never schedules. */
	onCreate?: () => void;
	onOpen: (schedule: JobSchedule) => void;
}) {
	return (
		<InsetCard
			title="Pianificazioni"
			description="Le esecuzioni che partono da sole, a orari fissi."
			actions={
				onCreate && (
					<Button size="sm" variant="outline" onClick={onCreate}>
						<AddCircleIcon className="size-4" />
						Nuova pianificazione
					</Button>
				)
			}
			footer={
				<div className="flex justify-end">
					<Button asChild size="sm" variant="ghost" className="group">
						<Link to="/jobs/schedules">
							La timeline di tutti i job
							<AltArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
						</Link>
					</Button>
				</div>
			}
		>
			{schedules.length === 0 ? (
				<InlineEmpty
					action={
						onCreate && (
							<Button size="sm" variant="outline" onClick={onCreate}>
								Pianifica questo job
							</Button>
						)
					}
				>
					{onCreate
						? "Non parte mai da solo."
						: "In produzione si avvia solo a mano, perché scrive senza simulazione."}
				</InlineEmpty>
			) : (
				<ul className="divide-y">
					{schedules.map(schedule => (
						<li key={schedule.key}>
							<button
								type="button"
								onClick={() => onOpen(schedule)}
								className="hover:bg-muted/50 focus-visible:ring-ring flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none"
							>
								<div className="min-w-0 flex-1">
									<p className="font-medium">{schedule.description}</p>
									<p className="text-muted-foreground font-mono text-xs">
										{schedule.cron}
									</p>
								</div>
								{schedule.paused ? (
									<StatusBadge status="neutral">In pausa</StatusBadge>
								) : (
									<span className="text-muted-foreground text-xs">
										Prossima: {formatDateTime(schedule.nextRun)}
									</span>
								)}
								<StatusBadge status={schedule.dryRun ? "info" : "warning"}>
									{schedule.dryRun ? "Simulazione" : "Applica"}
								</StatusBadge>
							</button>
						</li>
					))}
				</ul>
			)}
		</InsetCard>
	);
}

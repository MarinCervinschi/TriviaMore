import { useState } from "react";

import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { InsetCard } from "@/components/ui/inset-card";

import { ConsolePage } from "~/components/console-page";
import { FigureCard } from "~/components/figure-card";
import { commandOf } from "~/components/jobs/job-form";
import { RunChanges } from "~/components/jobs/run-changes";
import { RunStatusBadge } from "~/components/jobs/run-status-badge";
import { StopRunButton } from "~/components/jobs/stop-run-button";
import { NotFound } from "~/components/not-found";
import { ENVIRONMENT_TARGET, IS_PRODUCTION } from "~/lib/environment";
import { formatDateTime, formatDuration, formatNumber } from "~/lib/format";
import { removeQueuedRunFn, startJobFn } from "~/lib/jobs/api";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobInfo, JobRunDetail } from "~/lib/jobs/types";

export const Route = createFileRoute("/_console/jobs/$job/runs/$runId")({
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(jobQueries.jobs()),
			context.queryClient.ensureQueryData(jobQueries.run(params.runId)),
		]),
	component: RunPage,
});

function Facts({ rows }: { rows: [label: string, value: React.ReactNode][] }) {
	return (
		<dl className="divide-y text-sm">
			{rows.map(([label, value]) => (
				<div key={label} className="flex items-center justify-between gap-4 px-4 py-2">
					<dt className="text-muted-foreground shrink-0">{label}</dt>
					<dd className="min-w-0 truncate text-right">{value ?? "—"}</dd>
				</div>
			))}
		</dl>
	);
}

function RunPage() {
	const { runId } = Route.useParams();
	const { data: jobs } = useSuspenseQuery(jobQueries.jobs());
	const { data: run } = useSuspenseQuery(jobQueries.run(runId));
	if (!run) return <NotFound />;
	const job = jobs.find(entry => entry.name === run.job);
	return <RunView run={run} job={job} />;
}

function RunView({ run, job }: { run: JobRunDetail; job: JobInfo | undefined }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [confirming, setConfirming] = useState(false);

	const apply = useMutation({
		mutationFn: () =>
			startJobFn({ data: { job: run.job, params: run.params, dryRun: false } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "runs"] });
			toast.success("Esecuzione accodata.");
			void navigate({
				to: "/jobs/$job/runs/$runId",
				params: { job: run.job, runId: result.runId },
			});
		},
		onError: () => toast.error("Non è stato possibile avviare il job."),
	});

	const remove = useMutation({
		mutationFn: () => removeQueuedRunFn({ data: { id: run.id } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "runs"] });
			toast.success("Esecuzione rimossa dalla coda.");
			void navigate({ to: "/jobs/$job", params: { job: run.job } });
		},
		onError: () => toast.error("Non è stato possibile rimuovere l'esecuzione."),
	});

	const summary = Object.entries(run.summary ?? {});
	const params = Object.entries(run.params);
	const canApply = run.dryRun && run.status === "SUCCEEDED" && Boolean(job);
	const removed = (run.changes ?? []).reduce(
		(sum, entry) => sum + entry.counts.removed,
		0
	);

	return (
		<ConsolePage
			back={{
				to: "/jobs/$job",
				params: { job: run.job },
				label: job?.label ?? run.job,
			}}
			title={job?.label ?? run.job}
			description={
				run.dryRun
					? `Simulazione del ${formatDateTime(run.queuedAt)}: non ha scritto niente.`
					: `Applicata ${ENVIRONMENT_TARGET} il ${formatDateTime(run.queuedAt)}.`
			}
			actions={
				<>
					{run.status === "QUEUED" && (
						<Button asChild size="sm" variant="outline">
							<Link to="/jobs/$job" params={{ job: run.job }} search={{ edit: run.id }}>
								<Pen2Icon className="size-4" />
								Modifica
							</Link>
						</Button>
					)}
					{run.status === "QUEUED" && (
						<Button
							size="sm"
							variant="outline"
							className="text-danger hover:text-danger"
							disabled={remove.isPending}
							onClick={() => remove.mutate()}
						>
							{remove.isPending ? (
								<Spinner />
							) : (
								<TrashBinMinimalisticIcon className="size-4" />
							)}
							Rimuovi dalla coda
						</Button>
					)}
					<StopRunButton run={run} />
					{canApply && (
						<Button
							size="sm"
							disabled={apply.isPending}
							onClick={() => (IS_PRODUCTION ? setConfirming(true) : apply.mutate())}
						>
							{apply.isPending ? <Spinner /> : <PlayIcon className="size-4" />}
							Applica con gli stessi parametri
						</Button>
					)}
				</>
			}
		>
			{summary.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{summary.map(([label, value]) => (
						<FigureCard
							key={label}
							label={label}
							value={typeof value === "number" ? formatNumber(value) : value}
							hint={run.dryRun ? "In simulazione" : "Applicato"}
						/>
					))}
				</div>
			)}

			{run.dryRun && removed > 0 && (
				<p className="text-warning bg-warning/10 rounded-xl px-4 py-3 text-sm">
					Questa simulazione toglierebbe {formatNumber(removed)}{" "}
					{removed === 1 ? "riga" : "righe"}. Rileggi le rimozioni prima di applicare.
				</p>
			)}

			{run.error && (
				<p
					role="alert"
					className="text-danger bg-destructive/10 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap"
				>
					{run.error}
				</p>
			)}

			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="min-w-0">
					{run.status === "SUCCEEDED" ? (
						<RunChanges changes={run.changes ?? []} dryRun={run.dryRun} />
					) : (
						<InsetCard title="Modifiche">
							<p className="text-muted-foreground px-4 py-8 text-center text-sm">
								{run.status === "FAILED"
									? "Non è andata a buon fine, quindi non ci sono modifiche da mostrare."
									: "Compaiono qui quando l'esecuzione finisce."}
							</p>
						</InsetCard>
					)}
				</div>

				<InsetCard title="Esecuzione">
					<Facts
						rows={[
							["Stato", <RunStatusBadge key="status" status={run.status} />],
							["Modalità", run.dryRun ? "Simulazione" : "Applica"],
							["Origine", run.trigger === "SCHEDULE" ? "Pianificazione" : "Manuale"],
							["Accodata", formatDateTime(run.queuedAt)],
							["Avviata", formatDateTime(run.startedAt)],
							["Finita", formatDateTime(run.finishedAt)],
							["Durata", formatDuration(run.startedAt, run.finishedAt)],
							...params.map(
								([key, value]) => [key, String(value ?? "—")] as [string, string]
							),
						]}
					/>
					{job && (
						<div className="border-t px-4 py-3">
							<p className="text-muted-foreground mb-1.5 text-xs">
								Lo stesso da terminale:
							</p>
							<code className="bg-muted block rounded-lg px-3 py-2 font-mono text-xs break-all">
								{commandOf(job, run.params, run.dryRun)}
							</code>
						</div>
					)}
				</InsetCard>
			</div>

			<ConfirmationDialog
				open={confirming}
				onOpenChange={setConfirming}
				title="Applicare in produzione?"
				description={`${job?.label ?? "Il job"} scrive sul database di produzione, con gli stessi parametri di questa simulazione.`}
				confirmText="Applica"
				variant="destructive"
				onConfirm={() => apply.mutate()}
			/>
		</ConsolePage>
	);
}

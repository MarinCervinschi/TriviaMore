import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";

import {
	DetailList,
	DetailSection,
	DetailSheet,
	DetailSkeleton,
} from "~/components/detail-sheet";
import { ENVIRONMENT_TARGET } from "~/lib/environment";
import { formatDateTime, formatDuration, formatNumber } from "~/lib/format";
import { removeQueuedRunFn } from "~/lib/jobs/api";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobInfo, JobRunDetail } from "~/lib/jobs/types";

import { KindCounts } from "./run-changes";
import { RunStatusBadge } from "./run-status-badge";
import { StopRunButton } from "./stop-run-button";

/** A quick look at one run from a list: the outcome and its counts, and the way to its full page. */
export function RunPeek({
	id,
	jobs,
	onClose,
}: {
	id: string | undefined;
	jobs: JobInfo[];
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const { data: run, isPending } = useQuery({
		...jobQueries.run(id ?? ""),
		enabled: Boolean(id),
	});
	const job = run && jobs.find(entry => entry.name === run.job);

	const remove = useMutation({
		mutationFn: (runId: string) => removeQueuedRunFn({ data: { id: runId } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "runs"] });
			toast.success("Esecuzione rimossa dalla coda.");
			onClose();
		},
		onError: () => toast.error("Non è stato possibile rimuovere l'esecuzione."),
	});

	return (
		<DetailSheet
			open={Boolean(id)}
			onOpenChange={open => !open && onClose()}
			title={
				job?.label ?? run?.job ?? (isPending ? "Esecuzione" : "Esecuzione non trovata")
			}
			description={
				run &&
				(run.dryRun
					? "Simulazione: non scrive niente"
					: `Applica le modifiche ${ENVIRONMENT_TARGET}`)
			}
			footer={
				run && (
					<>
						{run.status === "QUEUED" && (
							<>
								<Button
									size="sm"
									variant="ghost"
									className="text-danger hover:text-danger mr-auto"
									disabled={remove.isPending}
									onClick={() => remove.mutate(run.id)}
								>
									{remove.isPending ? (
										<Spinner />
									) : (
										<TrashBinMinimalisticIcon className="size-4" />
									)}
									Rimuovi
								</Button>
								<Button asChild size="sm" variant="outline">
									<Link
										to="/jobs/$job"
										params={{ job: run.job }}
										search={{ edit: run.id }}
									>
										<Pen2Icon className="size-4" />
										Modifica
									</Link>
								</Button>
							</>
						)}
						<StopRunButton run={run} />
						<Button asChild size="sm">
							<Link
								to="/jobs/$job/runs/$runId"
								params={{ job: run.job, runId: run.id }}
							>
								Apri l'esecuzione
								<ArrowRightIcon className="size-4" />
							</Link>
						</Button>
					</>
				)
			}
		>
			{isPending ? <DetailSkeleton /> : run && <PeekBody run={run} />}
		</DetailSheet>
	);
}

function PeekBody({ run }: { run: JobRunDetail }) {
	const summary = Object.entries(run.summary ?? {});
	const sections = run.changes ?? [];

	return (
		<>
			<DetailSection title="Esecuzione">
				<DetailList
					rows={[
						["Stato", <RunStatusBadge key="status" status={run.status} />],
						["Accodata", formatDateTime(run.queuedAt)],
						["Durata", formatDuration(run.startedAt, run.finishedAt)],
						["Origine", run.trigger === "SCHEDULE" ? "Pianificazione" : "Manuale"],
						...Object.entries(run.params).map(
							([key, value]) => [key, String(value ?? "—")] as [string, string]
						),
					]}
				/>
			</DetailSection>

			{run.error && (
				<DetailSection title="Errore">
					<p
						role="alert"
						className="text-danger rounded-xl border px-3 py-2 text-sm whitespace-pre-wrap"
					>
						{run.error}
					</p>
				</DetailSection>
			)}

			{summary.length > 0 && (
				<DetailSection title={run.dryRun ? "Cosa cambierebbe" : "Cosa è cambiato"}>
					<DetailList
						rows={summary.map(([label, value]) => [
							label,
							typeof value === "number" ? formatNumber(value) : value,
						])}
					/>
				</DetailSection>
			)}

			{sections.length > 0 && (
				<DetailSection title="Per sezione">
					<DetailList
						rows={sections.map(section => [
							section.title,
							<KindCounts key={section.key} counts={section.counts} />,
						])}
					/>
				</DetailSection>
			)}
		</>
	);
}

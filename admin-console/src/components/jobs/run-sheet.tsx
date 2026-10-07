import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
	DetailList,
	DetailSection,
	DetailSheet,
	DetailSkeleton,
} from "~/components/detail-sheet";
import { formatDateTime, formatDuration, formatNumber } from "~/lib/format";
import { removeQueuedRunFn } from "~/lib/jobs/api";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobInfo, JobRun } from "~/lib/jobs/types";

import { RunStatusBadge } from "./run-status-badge";

export function RunSheet({
	id,
	jobs,
	onClose,
	onEdit,
}: {
	id: string | undefined;
	jobs: JobInfo[];
	onClose: () => void;
	onEdit: (run: JobRun) => void;
}) {
	const queryClient = useQueryClient();
	const { data: run, isPending } = useQuery({
		...jobQueries.run(id ?? ""),
		enabled: Boolean(id),
	});
	const job = run && jobs.find(j => j.name === run.job);

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
					: "Applica le modifiche allo staging")
			}
			footer={
				run?.status === "QUEUED" && (
					<>
						<Button
							size="sm"
							variant="outline"
							disabled={remove.isPending}
							onClick={() => remove.mutate(run.id)}
						>
							Rimuovi dalla coda
						</Button>
						<Button size="sm" onClick={() => onEdit(run)}>
							Modifica
						</Button>
					</>
				)
			}
		>
			{isPending ? <DetailSkeleton /> : run && <RunBody run={run} />}
		</DetailSheet>
	);
}

function RunBody({ run }: { run: JobRun }) {
	const params = Object.entries(run.params);
	const summary = Object.entries(run.summary ?? {});

	return (
		<>
			<DetailSection title="Esecuzione">
				<DetailList
					rows={[
						["Stato", <RunStatusBadge key="status" status={run.status} />],
						["Accodata", formatDateTime(run.queuedAt)],
						["Avviata", formatDateTime(run.startedAt)],
						["Finita", formatDateTime(run.finishedAt)],
						["Durata", formatDuration(run.startedAt, run.finishedAt)],
						["Origine", run.trigger === "SCHEDULE" ? "Pianificazione" : "Manuale"],
					]}
				/>
			</DetailSection>

			{params.length > 0 && (
				<DetailSection title="Parametri">
					<DetailList
						rows={params.map(([key, value]) => [key, String(value ?? "—")])}
					/>
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
		</>
	);
}

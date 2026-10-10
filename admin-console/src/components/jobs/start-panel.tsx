import { useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { TestTubeIcon } from "@solar-icons/react/linear/test-tube";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { InsetCard } from "@/components/ui/inset-card";

import {
	ENVIRONMENT_LABEL,
	ENVIRONMENT_TARGET,
	IS_PRODUCTION,
} from "~/lib/environment";
import { formatDuration } from "~/lib/format";
import { startJobFn, updateQueuedRunFn } from "~/lib/jobs/api";
import type { JobInfo, JobRun } from "~/lib/jobs/types";

import {
	type FieldValues,
	JobFields,
	type Mode,
	ModeChoice,
	commandOf,
	paramsOf,
	valuesOf,
} from "./job-form";

/** Starts the job from its own page, or with `editing` changes one of its runs still in the queue. */
export function StartPanel({
	job,
	lastSucceeded,
	editing,
	onDone,
	onCancelEdit,
}: {
	job: JobInfo;
	lastSucceeded: JobRun | undefined;
	editing?: JobRun;
	onDone: (runId: string) => void;
	onCancelEdit: () => void;
}) {
	const queryClient = useQueryClient();
	const [values, setValues] = useState<FieldValues>(() =>
		valuesOf(editing?.params ?? {})
	);
	const simulates = job.simulates !== false;
	const [mode, setMode] = useState<Mode>(
		!simulates || (editing && !editing.dryRun) ? "apply" : "dry-run"
	);
	const [confirming, setConfirming] = useState(false);
	const params = paramsOf(values);
	const dryRun = mode === "dry-run";

	const save = useMutation({
		mutationFn: () =>
			editing
				? updateQueuedRunFn({ data: { id: editing.id, params, dryRun } }).then(
						result =>
							result.success ? { success: true as const, runId: editing.id } : result
					)
				: startJobFn({ data: { job: job.name, params, dryRun } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "runs"] });
			toast.success(
				editing
					? "Esecuzione aggiornata."
					: dryRun
						? "Simulazione accodata."
						: "Esecuzione accodata."
			);
			onDone(result.runId);
		},
		onError: () => toast.error("Non è stato possibile salvare l'esecuzione."),
	});

	return (
		<InsetCard
			title={editing ? "Modifica l'esecuzione in coda" : "Avvia"}
			description={
				editing
					? "Le modifiche valgono quando il worker la prende in carico."
					: simulates
						? `Il worker lo esegue ${ENVIRONMENT_TARGET}, uno alla volta.`
						: `Si esegue ${ENVIRONMENT_TARGET} senza simulazione: non c'è niente da provare prima.`
			}
			footer={
				<div className="flex justify-end gap-2">
					{editing && (
						<Button size="sm" variant="outline" onClick={onCancelEdit}>
							Annulla
						</Button>
					)}
					<Button
						size="sm"
						disabled={save.isPending}
						onClick={() =>
							IS_PRODUCTION && !dryRun ? setConfirming(true) : save.mutate()
						}
					>
						{save.isPending ? (
							<Spinner />
						) : editing ? (
							<DisketteIcon className="size-4" />
						) : dryRun ? (
							<TestTubeIcon className="size-4" />
						) : (
							<PlayIcon className="size-4" />
						)}
						{save.isPending
							? "Salvataggio…"
							: editing
								? "Salva le modifiche"
								: !simulates
									? "Esegui"
									: dryRun
										? "Avvia la simulazione"
										: "Avvia e applica"}
					</Button>
				</div>
			}
		>
			<div className="flex flex-col gap-5 p-4">
				<JobFields job={job} values={values} onChange={setValues} />
				{simulates && <ModeChoice mode={mode} onChange={setMode} />}
				<dl className="text-sm">
					<div className="flex justify-between gap-4 py-1">
						<dt className="text-muted-foreground">Database</dt>
						<dd>{ENVIRONMENT_LABEL}</dd>
					</div>
					<div className="flex justify-between gap-4 py-1">
						<dt className="text-muted-foreground">Ultima durata</dt>
						<dd className="tabular-nums">
							{lastSucceeded
								? formatDuration(lastSucceeded.startedAt, lastSucceeded.finishedAt)
								: "—"}
						</dd>
					</div>
				</dl>
				<div className="space-y-1.5">
					<p className="text-muted-foreground text-xs">Lo stesso da terminale:</p>
					<code className="bg-muted block rounded-lg px-3 py-2 font-mono text-xs break-all">
						{commandOf(job, params, dryRun)}
					</code>
				</div>
			</div>
			<ConfirmationDialog
				open={confirming}
				onOpenChange={setConfirming}
				title="Applicare in produzione?"
				description={`${job.label} scrive sul database di produzione. Fallo dopo averne controllato una simulazione.`}
				confirmText="Applica"
				variant="destructive"
				onConfirm={() => save.mutate()}
			/>
		</InsetCard>
	);
}

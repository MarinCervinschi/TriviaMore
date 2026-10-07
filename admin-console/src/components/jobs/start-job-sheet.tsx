import { useEffect, useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { TestTubeIcon } from "@solar-icons/react/linear/test-tube";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { DetailList, DetailSection, DetailSheet } from "~/components/detail-sheet";
import { formatDateTime, formatDuration } from "~/lib/format";
import { startJobFn, updateQueuedRunFn } from "~/lib/jobs/api";
import type { JobInfo, JobRun } from "~/lib/jobs/types";

import {
	type FieldValues,
	JobFields,
	JobPicker,
	type Mode,
	ModeChoice,
	commandOf,
	paramsOf,
	valuesOf,
} from "./job-form";
import { RUN_STATUS } from "./run-status-badge";

/** Starts a job, or with `editing` changes a run that is still queued. */
export function StartJobSheet({
	open,
	jobs,
	runs,
	editing,
	onClose,
	onDone,
}: {
	open: boolean;
	jobs: JobInfo[];
	runs: JobRun[];
	editing?: JobRun;
	onClose: () => void;
	onDone: (runId: string) => void;
}) {
	const queryClient = useQueryClient();
	const [jobName, setJobName] = useState(jobs[0]?.name ?? "");
	const [values, setValues] = useState<FieldValues>({});
	const [mode, setMode] = useState<Mode>("dry-run");

	useEffect(() => {
		if (!open) return;
		setJobName(editing?.job ?? jobs[0]?.name ?? "");
		setValues(valuesOf(editing?.params ?? {}));
		setMode(editing && !editing.dryRun ? "apply" : "dry-run");
	}, [open, editing, jobs]);

	const job = jobs.find(j => j.name === jobName);
	const params = paramsOf(values);
	const dryRun = mode === "dry-run";

	const save = useMutation({
		mutationFn: () =>
			editing
				? updateQueuedRunFn({ data: { id: editing.id, params, dryRun } }).then(
						result =>
							result.success ? { success: true as const, runId: editing.id } : result
					)
				: startJobFn({ data: { job: jobName, params, dryRun } }),
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

	const lastSucceeded = runs.find(
		run => run.job === jobName && run.status === "SUCCEEDED"
	);

	return (
		<DetailSheet
			open={open}
			onOpenChange={next => !next && onClose()}
			title={editing ? "Modifica l'esecuzione" : "Avvia un job"}
			description={
				editing
					? "È ancora in coda: le modifiche valgono quando il worker la prende in carico."
					: "Il worker lo esegue sullo staging, uno alla volta."
			}
			footer={
				<>
					<Button size="sm" variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button
						size="sm"
						disabled={!job || save.isPending}
						onClick={() => save.mutate()}
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
								: dryRun
									? "Avvia la simulazione"
									: "Avvia e applica"}
					</Button>
				</>
			}
		>
			<JobPicker
				jobs={jobs}
				value={jobName}
				locked={Boolean(editing)}
				onChange={name => {
					setJobName(name);
					setValues({});
				}}
				hint={option => {
					const last = runs.find(
						run => run.job === option.name && run.id !== editing?.id
					);
					return last
						? `Ultima: ${RUN_STATUS[last.status].label.toLowerCase()} il ${formatDateTime(last.queuedAt)}`
						: "Mai eseguito dalla console";
				}}
			/>
			{job && <JobFields job={job} values={values} onChange={setValues} />}
			<ModeChoice mode={mode} onChange={setMode} />

			{job && (
				<DetailSection title="Riepilogo">
					<DetailList
						rows={[
							["Database", "Staging"],
							["Modalità", dryRun ? "Simulazione" : "Applica"],
							[
								"Ultima durata",
								lastSucceeded
									? formatDuration(lastSucceeded.startedAt, lastSucceeded.finishedAt)
									: "—",
							],
						]}
					/>
					<p className="text-muted-foreground text-xs">Lo stesso da terminale:</p>
					<code className="bg-muted block rounded-lg px-3 py-2 font-mono text-xs break-all">
						{commandOf(job, params, dryRun)}
					</code>
				</DetailSection>
			)}
		</DetailSheet>
	);
}

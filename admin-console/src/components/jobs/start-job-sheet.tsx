import { useEffect, useState } from "react";

import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";
import { RecordIcon } from "@solar-icons/react/linear/record";
import { TestTubeIcon } from "@solar-icons/react/linear/test-tube";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { DetailList, DetailSection, DetailSheet } from "~/components/detail-sheet";
import { formatDateTime, formatDuration } from "~/lib/format";
import { startJobFn, updateQueuedRunFn } from "~/lib/jobs/api";
import type { JobInfo, JobParams, JobRun } from "~/lib/jobs/types";

import { RUN_STATUS } from "./run-status-badge";

// Radix Select has no empty value, and an empty parameter means the job's own default.
const DEFAULT_OPTION = "__default__";

type Mode = "dry-run" | "apply";

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
	const [values, setValues] = useState<Record<string, string>>({});
	const [mode, setMode] = useState<Mode>("dry-run");

	useEffect(() => {
		if (!open) return;
		setJobName(editing?.job ?? jobs[0]?.name ?? "");
		setValues(
			Object.fromEntries(
				Object.entries(editing?.params ?? {}).map(([key, value]) => [
					key,
					String(value ?? ""),
				])
			)
		);
		setMode(editing && !editing.dryRun ? "apply" : "dry-run");
	}, [open, editing, jobs]);

	const job = jobs.find(j => j.name === jobName);
	const params: JobParams = Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== "")
	);
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

	const lastRun = (name: string) =>
		runs.find(run => run.job === name && run.id !== editing?.id);
	const lastSucceeded = runs.find(
		run => run.job === jobName && run.status === "SUCCEEDED"
	);
	const command = job
		? [
				job.command,
				...job.fields.flatMap(field =>
					params[field.key] ? [field.flag, String(params[field.key])] : []
				),
				...(dryRun ? [] : ["--apply"]),
			].join(" ")
		: "";

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
			<DetailSection title="Job">
				<div role="radiogroup" aria-label="Job" className="space-y-2">
					{(editing ? jobs.filter(j => j.name === editing.job) : jobs).map(option => {
						const selected = option.name === jobName;
						const last = lastRun(option.name);
						return (
							<button
								key={option.name}
								type="button"
								role="radio"
								aria-checked={selected}
								disabled={Boolean(editing)}
								onClick={() => {
									setJobName(option.name);
									setValues({});
								}}
								className={cn(
									"focus-visible:ring-ring flex w-full gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none",
									selected ? "border-foreground/30 bg-muted/60" : "hover:bg-muted/40",
									editing && "cursor-default"
								)}
							>
								{selected ? (
									<CheckCircleIcon className="text-foreground mt-0.5 size-4 shrink-0" />
								) : (
									<RecordIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
								)}
								<span className="min-w-0">
									<span className="block text-sm font-medium">{option.label}</span>
									<span className="text-muted-foreground mt-0.5 block text-xs">
										{option.description}
									</span>
									<span className="text-muted-foreground mt-1.5 block text-xs">
										{last
											? `Ultima: ${RUN_STATUS[last.status].label.toLowerCase()} il ${formatDateTime(last.queuedAt)}`
											: "Mai eseguito dalla console"}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			</DetailSection>

			{job && job.fields.length > 0 && (
				<DetailSection title="Parametri">
					{job.fields.map(field => (
						<div key={field.key} className="space-y-1.5">
							<Label htmlFor={`field-${field.key}`}>{field.label}</Label>
							<Select
								value={values[field.key] || DEFAULT_OPTION}
								onValueChange={value =>
									setValues(prev => ({
										...prev,
										[field.key]: value === DEFAULT_OPTION ? "" : value,
									}))
								}
							>
								<SelectTrigger id={`field-${field.key}`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{field.options.map(option => (
										<SelectItem
											key={option.value}
											value={option.value || DEFAULT_OPTION}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">{field.description}</p>
						</div>
					))}
				</DetailSection>
			)}

			<DetailSection title="Modalità">
				<div role="radiogroup" aria-label="Modalità" className="grid grid-cols-2 gap-2">
					<ModeOption
						selected={mode === "dry-run"}
						onSelect={() => setMode("dry-run")}
						icon={TestTubeIcon}
						title="Simula"
						description="Calcola cosa cambierebbe. Non scrive niente."
					/>
					<ModeOption
						selected={mode === "apply"}
						onSelect={() => setMode("apply")}
						icon={PenNewSquareIcon}
						title="Applica"
						description="Scrive le modifiche nello staging."
					/>
				</div>
				{!dryRun && (
					<p className="text-warning bg-warning/10 border-warning/20 flex gap-2 rounded-xl border px-3 py-2 text-xs">
						<DangerTriangleIcon className="mt-px size-4 shrink-0" />
						Le modifiche vanno nello staging in una sola transazione. La produzione non
						cambia: ci arriva solo con una promozione.
					</p>
				)}
			</DetailSection>

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
						{command}
					</code>
				</DetailSection>
			)}
		</DetailSheet>
	);
}

function ModeOption({
	selected,
	onSelect,
	icon: Icon,
	title,
	description,
}: {
	selected: boolean;
	onSelect: () => void;
	icon: typeof TestTubeIcon;
	title: string;
	description: string;
}) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			onClick={onSelect}
			className={cn(
				"focus-visible:ring-ring rounded-xl border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none",
				selected ? "border-foreground/30 bg-muted/60" : "hover:bg-muted/40"
			)}
		>
			<Icon
				className={cn(
					"mb-1.5 size-4",
					selected ? "text-foreground" : "text-muted-foreground"
				)}
			/>
			<span className="block text-sm font-medium">{title}</span>
			<span className="text-muted-foreground mt-0.5 block text-xs">{description}</span>
		</button>
	);
}

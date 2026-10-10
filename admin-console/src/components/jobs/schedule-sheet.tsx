import { useEffect, useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PlusGlyph, Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

import { DetailList, DetailSection, DetailSheet } from "~/components/detail-sheet";
import { IS_PRODUCTION } from "~/lib/environment";
import { formatDateTime } from "~/lib/format";
import { deleteScheduleFn, saveScheduleFn } from "~/lib/jobs/api";
import { type Frequency, WEEKDAYS, fromCron, toCron } from "~/lib/jobs/cron";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobInfo, JobSchedule } from "~/lib/jobs/types";

import {
	type FieldValues,
	JobFields,
	JobPicker,
	type Mode,
	ModeChoice,
	paramsOf,
	valuesOf,
} from "./job-form";

const DEFAULT_TIME = "06:00";
const DEFAULT_FREQUENCY: Frequency = { kind: "weekly", weekday: 1, time: DEFAULT_TIME };

const KIND_LABELS: Record<Frequency["kind"], string> = {
	daily: "Ogni giorno",
	weekly: "Ogni settimana",
	monthly: "Ogni mese",
	custom: "Espressione cron",
};

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

/** Switches the kind of frequency and keeps the time already chosen. */
function withKind(current: Frequency, kind: Frequency["kind"]): Frequency {
	if (kind === "custom") return { kind, cron: toCron(current) };
	const time = current.kind === "custom" ? DEFAULT_TIME : current.time;
	if (kind === "daily") return { kind, time };
	if (kind === "weekly") return { kind, weekday: 1, time };
	return { kind, day: 1, time };
}

/** Creates a schedule, or with `editing` changes or deletes one; `job` fixes the job, from that job's page. */
export function ScheduleSheet({
	open,
	jobs,
	editing,
	job: fixedJob,
	onClose,
}: {
	open: boolean;
	jobs: JobInfo[];
	editing?: JobSchedule;
	job?: string;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const [jobName, setJobName] = useState(fixedJob ?? jobs[0]?.name ?? "");
	const [values, setValues] = useState<FieldValues>({});
	const [mode, setMode] = useState<Mode>("dry-run");
	const [frequency, setFrequency] = useState<Frequency>(DEFAULT_FREQUENCY);
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	useEffect(() => {
		if (!open) return;
		setJobName(editing?.job ?? fixedJob ?? jobs[0]?.name ?? "");
		setValues(valuesOf(editing?.params ?? {}));
		setMode(editing && !editing.dryRun ? "apply" : "dry-run");
		setFrequency(editing ? fromCron(editing.cron) : DEFAULT_FREQUENCY);
	}, [open, editing, fixedJob, jobs]);

	// In production a schedule only simulates, so a job that cannot is never offered.
	const schedulable = IS_PRODUCTION ? jobs.filter(j => j.simulates !== false) : jobs;
	const job = jobs.find(j => j.name === jobName);
	const cron = toCron(frequency);
	const previewCron = useDebounce(cron, 400);
	const { data: preview } = useQuery({
		...jobQueries.preview(previewCron),
		enabled: open && previewCron !== "",
	});

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["jobs", "schedules"] });

	const save = useMutation({
		mutationFn: () =>
			saveScheduleFn({
				data: {
					key: editing?.key,
					job: jobName,
					cron,
					params: paramsOf(values),
					dryRun: IS_PRODUCTION || mode === "dry-run",
				},
			}),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void invalidate();
			toast.success(editing ? "Pianificazione aggiornata." : "Pianificazione creata.");
			onClose();
		},
		onError: () => toast.error("Non è stato possibile salvare la pianificazione."),
	});

	const remove = useMutation({
		mutationFn: (schedule: JobSchedule) =>
			deleteScheduleFn({ data: { key: schedule.key } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void invalidate();
			toast.success(
				"Pianificazione eliminata. Le esecuzioni passate restano nello storico."
			);
			onClose();
		},
		onError: () => toast.error("Non è stato possibile eliminare la pianificazione."),
	});

	const busy = save.isPending || remove.isPending;

	return (
		<DetailSheet
			open={open}
			onOpenChange={next => !next && onClose()}
			title={editing ? "Modifica la pianificazione" : "Nuova pianificazione"}
			description={
				editing?.paused
					? "In pausa: le modifiche si salvano, e valgono quando la riprendi."
					: "Il worker accoda il job a ogni scadenza, all'ora di Roma. Se era spento, recupera solo l'ultima."
			}
			footer={
				<>
					{editing && (
						<Button
							size="sm"
							variant="ghost"
							className="text-danger hover:text-danger mr-auto"
							disabled={busy}
							onClick={() => setConfirmingDelete(true)}
						>
							{remove.isPending ? (
								<Spinner />
							) : (
								<TrashBinMinimalisticIcon className="size-4" />
							)}
							Elimina
						</Button>
					)}
					<Button size="sm" variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button
						size="sm"
						disabled={!job || busy || preview?.valid === false}
						onClick={() => save.mutate()}
					>
						{save.isPending ? (
							<Spinner />
						) : editing ? (
							<DisketteIcon className="size-4" />
						) : (
							<PlusGlyph className="size-4" />
						)}
						{save.isPending
							? "Salvataggio…"
							: editing
								? "Salva le modifiche"
								: "Crea la pianificazione"}
					</Button>
				</>
			}
		>
			<JobPicker
				jobs={schedulable}
				value={jobName}
				locked={Boolean(editing || fixedJob)}
				onChange={name => {
					setJobName(name);
					setValues({});
				}}
			/>
			{job && <JobFields job={job} values={values} onChange={setValues} />}
			{IS_PRODUCTION ? (
				<DetailSection title="Modalità">
					<p className="text-muted-foreground text-sm">
						In produzione una pianificazione fa solo simulazioni: le modifiche si
						applicano a mano, da un'esecuzione.
					</p>
				</DetailSection>
			) : (
				<ModeChoice mode={mode} onChange={setMode} />
			)}

			<DetailSection title="Frequenza">
				<div className="grid grid-cols-2 gap-2">
					<div className="space-y-1.5">
						<Label htmlFor="frequency-kind">Ripeti</Label>
						<Select
							value={frequency.kind}
							onValueChange={kind =>
								setFrequency(withKind(frequency, kind as Frequency["kind"]))
							}
						>
							<SelectTrigger id="frequency-kind">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(KIND_LABELS).map(([kind, label]) => (
									<SelectItem key={kind} value={kind}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{frequency.kind === "weekly" && (
						<div className="space-y-1.5">
							<Label htmlFor="frequency-weekday">Giorno</Label>
							<Select
								value={String(frequency.weekday)}
								onValueChange={weekday =>
									setFrequency({ ...frequency, weekday: Number(weekday) })
								}
							>
								<SelectTrigger id="frequency-weekday">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[1, 2, 3, 4, 5, 6, 0].map(weekday => (
										<SelectItem
											key={weekday}
											value={String(weekday)}
											className="capitalize"
										>
											{WEEKDAYS[weekday]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{frequency.kind === "monthly" && (
						<div className="space-y-1.5">
							<Label htmlFor="frequency-day">Giorno del mese</Label>
							<Select
								value={String(frequency.day)}
								onValueChange={day => setFrequency({ ...frequency, day: Number(day) })}
							>
								<SelectTrigger id="frequency-day">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{DAYS.map(day => (
										<SelectItem key={day} value={String(day)}>
											{day}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{frequency.kind !== "custom" && (
						<div className="space-y-1.5">
							<Label htmlFor="frequency-time">Ora</Label>
							<Input
								id="frequency-time"
								type="time"
								value={frequency.time}
								onChange={event =>
									setFrequency({ ...frequency, time: event.target.value })
								}
							/>
						</div>
					)}
				</div>

				{frequency.kind === "custom" && (
					<div className="space-y-1.5">
						<Label htmlFor="frequency-cron">Espressione</Label>
						<Input
							id="frequency-cron"
							className="font-mono"
							value={frequency.cron}
							onChange={event =>
								setFrequency({ kind: "custom", cron: event.target.value })
							}
						/>
						<p className="text-muted-foreground text-xs">
							Minuto, ora, giorno, mese, giorno della settimana. Per esempio{" "}
							<code className="font-mono">0 4 * 9,10 1</code>: ogni lunedì alle 04:00, a
							settembre e ottobre.
						</p>
					</div>
				)}
			</DetailSection>

			<DetailSection title="Prossime esecuzioni">
				{preview?.valid === false ? (
					<p role="alert" className="text-danger text-sm">
						{preview.error}
					</p>
				) : (
					<DetailList
						rows={(preview?.valid ? preview.next : []).map((date, index) => [
							`${index + 1}ª`,
							formatDateTime(date),
						])}
					/>
				)}
			</DetailSection>

			{editing && (
				<ConfirmationDialog
					open={confirmingDelete}
					onOpenChange={setConfirmingDelete}
					title="Eliminare la pianificazione?"
					description={`Il job "${job?.label ?? editing.job}" non verrà più accodato (${editing.description.toLowerCase()}). Le esecuzioni passate restano nello storico.`}
					confirmText="Elimina"
					variant="destructive"
					onConfirm={() => remove.mutate(editing)}
				/>
			)}
		</DetailSheet>
	);
}

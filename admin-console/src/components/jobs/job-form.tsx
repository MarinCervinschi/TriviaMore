import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";
import { RecordIcon } from "@solar-icons/react/linear/record";
import { TestTubeIcon } from "@solar-icons/react/linear/test-tube";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { DetailSection } from "~/components/detail-sheet";
import { ENVIRONMENT_TARGET, IS_PRODUCTION } from "~/lib/environment";
import type { JobInfo, JobParams } from "~/lib/jobs/types";

// Radix Select has no empty value, and an empty parameter means the job's own default.
const DEFAULT_OPTION = "__default__";

export type Mode = "dry-run" | "apply";

/** The form's values as strings, where an empty one stands for the job's default. */
export type FieldValues = Record<string, string>;

export const valuesOf = (params: JobParams): FieldValues =>
	Object.fromEntries(
		Object.entries(params).map(([key, value]) => [key, String(value ?? "")])
	);

export const paramsOf = (values: FieldValues): JobParams =>
	Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));

/** The terminal command that does the same as the form. */
export function commandOf(job: JobInfo, params: JobParams, dryRun: boolean): string {
	return [
		job.command,
		...job.fields.flatMap(field =>
			!params[field.key]
				? []
				: field.toggle
					? [field.flag]
					: [field.flag, String(params[field.key])]
		),
		(dryRun ? job.terminal?.dryRun : (job.terminal?.apply ?? "--apply")) ?? "",
	]
		.filter(Boolean)
		.join(" ");
}

const OPTION =
	"focus-visible:ring-ring rounded-xl border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none";

export function JobPicker({
	jobs,
	value,
	onChange,
	locked,
	hint,
}: {
	jobs: JobInfo[];
	value: string;
	onChange: (name: string) => void;
	/** Shows only the chosen job, for a record whose job cannot change. */
	locked?: boolean;
	hint?: (job: JobInfo) => string;
}) {
	return (
		<DetailSection title="Job">
			<div role="radiogroup" aria-label="Job" className="space-y-2">
				{(locked ? jobs.filter(job => job.name === value) : jobs).map(job => {
					const selected = job.name === value;
					return (
						<button
							key={job.name}
							type="button"
							role="radio"
							aria-checked={selected}
							disabled={locked}
							onClick={() => onChange(job.name)}
							className={cn(
								OPTION,
								"flex w-full gap-3",
								selected ? "border-foreground/30 bg-muted/60" : "hover:bg-muted/40",
								locked && "cursor-default"
							)}
						>
							{selected ? (
								<CheckCircleIcon className="text-foreground mt-0.5 size-4 shrink-0" />
							) : (
								<RecordIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
							)}
							<span className="min-w-0">
								<span className="block text-sm font-medium">{job.label}</span>
								<span className="text-muted-foreground mt-0.5 block text-xs">
									{job.description}
								</span>
								{hint && (
									<span className="text-muted-foreground mt-1.5 block text-xs">
										{hint(job)}
									</span>
								)}
							</span>
						</button>
					);
				})}
			</div>
		</DetailSection>
	);
}

export function JobFields({
	job,
	values,
	onChange,
}: {
	job: JobInfo;
	values: FieldValues;
	onChange: (values: FieldValues) => void;
}) {
	if (job.fields.length === 0) return null;
	return (
		<DetailSection title="Parametri">
			{job.fields.map(field => (
				<div key={field.key} className="space-y-1.5">
					<Label htmlFor={`field-${field.key}`}>{field.label}</Label>
					<Select
						value={values[field.key] || DEFAULT_OPTION}
						onValueChange={value =>
							onChange({
								...values,
								[field.key]: value === DEFAULT_OPTION ? "" : value,
							})
						}
					>
						<SelectTrigger id={`field-${field.key}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{field.options.map(option => (
								<SelectItem key={option.value} value={option.value || DEFAULT_OPTION}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-muted-foreground text-xs">{field.description}</p>
				</div>
			))}
		</DetailSection>
	);
}

export function ModeChoice({
	mode,
	onChange,
}: {
	mode: Mode;
	onChange: (mode: Mode) => void;
}) {
	return (
		<DetailSection title="Modalità">
			<div role="radiogroup" aria-label="Modalità" className="grid grid-cols-2 gap-2">
				<ModeOption
					selected={mode === "dry-run"}
					onSelect={() => onChange("dry-run")}
					icon={TestTubeIcon}
					title="Simula"
					description="Calcola cosa cambierebbe. Non scrive niente."
				/>
				<ModeOption
					selected={mode === "apply"}
					onSelect={() => onChange("apply")}
					icon={PenNewSquareIcon}
					title="Applica"
					description={`Scrive le modifiche ${ENVIRONMENT_TARGET}.`}
				/>
			</div>
			{mode === "apply" && (
				<p className="text-warning bg-warning/10 border-warning/20 flex gap-2 rounded-xl border px-3 py-2 text-xs">
					<DangerTriangleIcon className="mt-px size-4 shrink-0" />
					{IS_PRODUCTION
						? "Le modifiche vanno in produzione, in una sola transazione. Prima lancia una simulazione e controllane il risultato."
						: "Le modifiche vanno nel database locale, in una sola transazione."}
				</p>
			)}
		</DetailSection>
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
				OPTION,
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

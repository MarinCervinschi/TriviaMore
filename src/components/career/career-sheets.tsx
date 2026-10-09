import { type ReactNode, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { type Icon, PlusGlyph, Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/hooks/useDebounce";
import { browseQueries } from "@/lib/browse/queries";
import { PASS_GRADE, TOP_GRADE } from "@/lib/crm/career/engine";
import {
	useAddCareerExam,
	useRemoveCareerExam,
	useSetCareerChoices,
	useUpdateCareerExam,
} from "@/lib/crm/mutations";
import type { Career, CareerExam } from "@/lib/crm/types";
import { cn } from "@/lib/utils";
import { gradeBand } from "@/lib/utils/grading";

import { GradeRing, Stepper } from "./career-controls";
import {
	HONOURS_STEP,
	choiceLabel,
	formatExamDate,
	formatGrade,
	formatStep,
	yearLabel,
} from "./career-model";

const STATUS_OPTIONS = [
	{ value: "PLANNED", label: "Da sostenere", icon: ClockCircleIcon },
	{ value: "PASSED", label: "Superato", icon: CheckCircleIcon },
	{ value: "REJECTED", label: "Rifiutato", icon: RestartIcon },
] satisfies { value: CareerExam["status"]; label: string; icon: Icon }[];

const NO_YEAR = "none";

function SaveButton({
	pending,
	disabled,
	onClick,
	children,
}: {
	pending: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<Button onClick={onClick} disabled={pending || disabled}>
			{pending ? <Spinner className="size-4" /> : <DisketteIcon className="size-4" />}
			{children}
		</Button>
	);
}

function Field({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col items-start gap-2">
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
		</div>
	);
}

function YearSelect({
	id,
	value,
	onChange,
	years,
}: {
	id: string;
	value: number | null;
	onChange: (value: number | null) => void;
	years: number;
}) {
	return (
		<Select
			value={value === null ? NO_YEAR : String(value)}
			onValueChange={next => onChange(next === NO_YEAR ? null : Number(next))}
		>
			<SelectTrigger id={id} className="w-40">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{Array.from({ length: years }, (_, i) => (
					<SelectItem key={i + 1} value={String(i + 1)}>
						{yearLabel(i + 1)}
					</SelectItem>
				))}
				<SelectItem value={NO_YEAR}>Nessun anno</SelectItem>
			</SelectContent>
		</Select>
	);
}

function ExternalCheck({
	id,
	checked,
	onChange,
}: {
	id: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={value => onChange(value === true)}
				className="mt-0.5"
			/>
			<span>
				<span className="block font-medium">Sostenuto in un altro ateneo</span>
				<span className="text-muted-foreground block text-xs">
					Per esempio in Erasmus o prima di un trasferimento.
				</span>
			</span>
		</label>
	);
}

const yearCount = (career: Career) =>
	Math.max(
		3,
		...career.exams.map(exam => exam.classYear ?? 0),
		...career.choiceGroups.map(group => group.classYear)
	);

/** Records the outcome of one exam: esito, voto, lode and data. */
export function ExamSheet({
	career,
	exam,
	onClose,
}: {
	career: Career;
	exam: CareerExam | undefined;
	onClose: () => void;
}) {
	return (
		<Sheet open={Boolean(exam)} onOpenChange={open => !open && onClose()}>
			<SheetContent className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md">
				{exam && (
					<ExamForm
						key={exam.id}
						exam={exam}
						years={yearCount(career)}
						onClose={onClose}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}

function GradePicker({
	value,
	onChange,
	allowHonours,
}: {
	value: number | null;
	onChange: (step: number) => void;
	allowHonours: boolean;
}) {
	const steps = Array.from(
		{ length: (allowHonours ? HONOURS_STEP : TOP_GRADE) - PASS_GRADE + 1 },
		(_, i) => PASS_GRADE + i
	);
	return (
		<div role="radiogroup" aria-label="Voto" className="grid grid-cols-7 gap-1.5">
			{steps.map(step => {
				const selected = step === value;
				return (
					<button
						key={step}
						type="button"
						role="radio"
						aria-checked={selected}
						onClick={() => onChange(step)}
						className={cn(
							"focus-visible:ring-ring h-10 rounded-lg text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
							selected
								? cn(
										gradeBand(step).text,
										"bg-current/10 font-semibold ring-2 ring-current ring-inset"
									)
								: "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
						)}
					>
						{formatStep(step)}
					</button>
				);
			})}
		</div>
	);
}

const parseDay = (value: string) => {
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year!, month! - 1, day);
};

function DateField({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const selected = value ? parseDay(value) : undefined;
	const pick = (day: Date | undefined) => {
		onChange(day ? format(day, "yyyy-MM-dd") : "");
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id="exam-date"
					variant="outline"
					className={cn(
						"w-56 justify-start font-normal",
						!value && "text-muted-foreground"
					)}
				>
					<CalendarMinimalisticIcon className="size-4" />
					{value ? formatExamDate(value) : "Scegli la data"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					startMonth={new Date(2000, 0)}
					endMonth={new Date()}
					disabled={{ after: new Date() }}
					selected={selected}
					defaultMonth={selected}
					onSelect={pick}
				/>
				<div className="border-border flex justify-between gap-2 border-t p-2">
					<Button
						variant="ghost"
						size="sm"
						disabled={!value}
						onClick={() => pick(undefined)}
					>
						Togli la data
					</Button>
					<Button variant="outline" size="sm" onClick={() => pick(new Date())}>
						Oggi
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function ExamForm({
	exam,
	years,
	onClose,
}: {
	exam: CareerExam;
	years: number;
	onClose: () => void;
}) {
	const update = useUpdateCareerExam();
	const remove = useRemoveCareerExam();
	const [confirming, setConfirming] = useState(false);
	const [status, setStatus] = useState<CareerExam["status"]>(exam.status);
	const [step, setStep] = useState<number | null>(
		exam.honours ? HONOURS_STEP : exam.grade
	);
	const [examDate, setExamDate] = useState(exam.examDate ?? "");
	const [name, setName] = useState(exam.name);
	const [cfu, setCfu] = useState(exam.cfu);
	const [classYear, setClassYear] = useState(exam.classYear);
	const [graded, setGraded] = useState(exam.graded);
	const [external, setExternal] = useState(exam.external);

	const offPlan = exam.planCode === null;
	const typed = offPlan && exam.classId === null;
	const withGrade = graded && status !== "PLANNED";
	const shown = status === "REJECTED" && step === HONOURS_STEP ? TOP_GRADE : step;
	const missingGrade = graded && status === "PASSED" && step === null;

	const save = () =>
		update.mutate(
			{
				id: exam.id,
				status,
				grade: withGrade && shown !== null ? Math.min(shown, TOP_GRADE) : null,
				honours: withGrade && status === "PASSED" && shown === HONOURS_STEP,
				examDate: status === "PLANNED" || examDate === "" ? null : examDate,
				...(offPlan ? { classYear } : {}),
				...(typed ? { name: name.trim(), cfu, graded, external } : {}),
			},
			{ onSuccess: onClose }
		);

	return (
		<>
			<SheetHeader className="flex-row items-start gap-4 space-y-0 pr-8">
				<div className="min-w-0 flex-1 space-y-1.5">
					<SheetTitle className="text-pretty">{exam.name}</SheetTitle>
					<SheetDescription>
						{[
							`${exam.cfu} CFU`,
							yearLabel(exam.classYear),
							exam.graded ? "con voto" : "idoneità",
							!offPlan ? "dal piano" : typed ? "inserito a mano" : "dal catalogo",
							exam.external && "altro ateneo",
						]
							.filter(Boolean)
							.join(" · ")}
					</SheetDescription>
				</div>
				{status === "PASSED" && graded && shown !== null && (
					<GradeRing step={shown} size={52} />
				)}
			</SheetHeader>

			<div className="flex flex-col gap-6">
				<Field label="Esito">
					<SegmentedControl
						label="Esito"
						value={status}
						onChange={setStatus}
						options={STATUS_OPTIONS}
						className="flex w-full [&>button]:flex-1 [&>button]:justify-center"
					/>
				</Field>

				{withGrade && (
					<div className="space-y-2">
						<div className="flex items-baseline justify-between gap-3">
							<Label>{status === "REJECTED" ? "Voto che hai rifiutato" : "Voto"}</Label>
							{status === "REJECTED" && (
								<span className="text-muted-foreground text-xs">facoltativo</span>
							)}
						</div>
						<GradePicker
							value={shown}
							onChange={setStep}
							allowHonours={status === "PASSED"}
						/>
					</div>
				)}

				{status !== "PLANNED" && (
					<Field label="Data dell'esame" htmlFor="exam-date">
						<DateField value={examDate} onChange={setExamDate} />
					</Field>
				)}

				{offPlan && (
					<div className="flex flex-col gap-5 border-t pt-5">
						{typed && (
							<Field label="Nome" htmlFor="exam-name">
								<Input
									id="exam-name"
									value={name}
									onChange={event => setName(event.target.value)}
									className="w-full"
								/>
							</Field>
						)}
						<div className="flex flex-wrap gap-6">
							{typed && (
								<Field label="CFU">
									<Stepper label="CFU" value={cfu} onChange={setCfu} min={1} max={60} />
								</Field>
							)}
							<Field label="Anno" htmlFor="exam-year">
								<YearSelect
									id="exam-year"
									value={classYear}
									onChange={setClassYear}
									years={years}
								/>
							</Field>
						</div>
						{typed && (
							<>
								<label className="flex items-center gap-2 text-sm">
									<Switch checked={graded} onCheckedChange={setGraded} />
									Ha un voto in trentesimi
								</label>
								<ExternalCheck
									id="exam-external"
									checked={external}
									onChange={setExternal}
								/>
							</>
						)}
					</div>
				)}
			</div>

			<SheetFooter className="mt-auto flex-row gap-2">
				<Button
					variant="ghost"
					className="text-danger hover:text-danger mr-auto"
					onClick={() => setConfirming(true)}
				>
					<TrashBinMinimalisticIcon className="size-4" />
					Togli
				</Button>
				<Button variant="outline" onClick={onClose}>
					Annulla
				</Button>
				<SaveButton
					pending={update.isPending}
					disabled={missingGrade || (typed && name.trim() === "")}
					onClick={save}
				>
					Salva
				</SaveButton>
			</SheetFooter>

			<ConfirmationDialog
				open={confirming}
				onOpenChange={setConfirming}
				title={`Togliere ${exam.name} dal libretto?`}
				description={
					exam.status === "PASSED"
						? `Perdi l'esito registrato${exam.graded && exam.grade ? `, ${formatGrade(exam)}` : ""}, e la media cambia.`
						: "Lo puoi rimettere quando vuoi."
				}
				confirmText="Togli"
				variant="destructive"
				onConfirm={() => remove.mutate(exam.id, { onSuccess: onClose })}
			/>
		</>
	);
}

/** Adds an exam the plan does not list: picked from the catalogue, or typed by hand when it is not there. */
export function AddExamSheet({
	career,
	open,
	onClose,
}: {
	career: Career;
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Sheet open={open} onOpenChange={next => !next && onClose()}>
			<SheetContent className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-lg">
				{open && <AddExamForm career={career} onClose={onClose} />}
			</SheetContent>
		</Sheet>
	);
}

type Scope = "course" | "department" | "all";

const SCOPES: { value: Scope; label: string }[] = [
	{ value: "course", label: "Il mio corso" },
	{ value: "department", label: "Il mio dipartimento" },
	{ value: "all", label: "Tutto l'ateneo" },
];

type Picked = {
	classId: string;
	name: string;
	cfu: number;
	classYear: number | null;
	context: string;
};

function ClassSearch({
	career,
	onPick,
}: {
	career: Career;
	onPick: (picked: Picked) => void;
}) {
	const [query, setQuery] = useState("");
	const [scope, setScope] = useState<Scope>("course");
	const debounced = useDebounce(query.trim(), 250);
	const params = {
		query: debounced || undefined,
		courseId: scope === "course" ? career.course.id : undefined,
		departmentId: scope === "department" ? career.course.department.id : undefined,
		pageSize: 20,
	};
	const enabled = scope !== "all" || debounced.length >= 2;
	const { data, isFetching } = useQuery({
		...browseQueries.searchClasses(params),
		enabled,
	});
	const held = new Set(career.exams.map(exam => exam.classId).filter(Boolean));
	const results = enabled ? (data?.data ?? []) : [];

	return (
		<div className="flex flex-col gap-3">
			<div className="relative">
				<MagnifierIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
				<Input
					value={query}
					onChange={event => setQuery(event.target.value)}
					placeholder="Cerca un insegnamento"
					aria-label="Cerca un insegnamento"
					className="pl-9"
					autoFocus
				/>
				{isFetching && (
					<Spinner className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
				)}
			</div>
			<SegmentedControl
				label="Dove cercare"
				value={scope}
				onChange={setScope}
				size="sm"
				options={SCOPES}
				className="self-start"
			/>
			<ul className="divide-border/60 max-h-[22rem] divide-y overflow-y-auto rounded-xl border">
				{!enabled && (
					<li className="text-muted-foreground px-3 py-6 text-center text-sm">
						Scrivi almeno due lettere per cercare in tutto l'ateneo.
					</li>
				)}
				{enabled && results.length === 0 && !isFetching && (
					<li className="text-muted-foreground px-3 py-6 text-center text-sm">
						Nessun insegnamento trovato.
					</li>
				)}
				{results.map(klass => {
					const inRecord = held.has(klass.id);
					return (
						<li key={`${klass.course.id}-${klass.id}`}>
							<button
								type="button"
								disabled={inRecord}
								onClick={() =>
									onPick({
										classId: klass.id,
										name: klass.name,
										cfu: klass.cfu ?? 6,
										classYear:
											klass.course.id === career.course.id ? klass.classYear : null,
										context: [klass.course.name, klass.course.department.code].join(
											" · "
										),
									})
								}
								className="hover:bg-muted/50 focus-visible:ring-ring flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent motion-reduce:transition-none"
							>
								<IconTile
									size="sm"
									variant="soft"
									className="text-chart-2-ink shrink-0"
								>
									<BookIcon />
								</IconTile>
								<span className="min-w-0 flex-1">
									<span className="block text-sm font-medium text-pretty">
										{klass.name}
									</span>
									<span className="text-muted-foreground block truncate text-xs">
										{[
											klass.course.name,
											klass.course.department.code,
											yearLabel(klass.classYear),
										].join(" · ")}
									</span>
								</span>
								<span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
									{inRecord ? "Già nel libretto" : klass.cfu ? `${klass.cfu} CFU` : ""}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function AddExamForm({ career, onClose }: { career: Career; onClose: () => void }) {
	const add = useAddCareerExam();
	const [picked, setPicked] = useState<Picked | null>(null);
	const [manual, setManual] = useState(false);
	const [name, setName] = useState("");
	const [cfu, setCfu] = useState(6);
	const [classYear, setClassYear] = useState<number | null>(null);
	const [graded, setGraded] = useState(true);
	const [external, setExternal] = useState(false);
	const choosing = !picked && !manual;

	const pick = (next: Picked) => {
		setPicked(next);
		setName(next.name);
		setCfu(next.cfu);
		setClassYear(next.classYear);
	};
	const back = () => {
		setPicked(null);
		setManual(false);
		setName("");
		setCfu(6);
		setClassYear(null);
	};

	return (
		<>
			<SheetHeader>
				<SheetTitle>Aggiungi un esame</SheetTitle>
				<SheetDescription>Per gli esami fuori dal piano.</SheetDescription>
			</SheetHeader>

			{choosing ? (
				<>
					<ClassSearch career={career} onPick={pick} />
					<button
						type="button"
						onClick={() => setManual(true)}
						className="text-muted-foreground hover:text-foreground self-start text-sm underline-offset-4 transition-colors hover:underline motion-reduce:transition-none"
					>
						Non lo trovi? Inseriscilo a mano
					</button>
				</>
			) : (
				<div className="flex flex-col gap-5">
					{picked ? (
						<div className="bg-muted/50 flex items-center gap-3 rounded-xl px-3 py-2.5">
							<IconTile size="sm" variant="soft" className="text-chart-2-ink shrink-0">
								<BookIcon />
							</IconTile>
							<p className="min-w-0 flex-1 text-sm">
								<span className="block font-medium text-pretty">{picked.name}</span>
								<span className="text-muted-foreground block text-xs">
									{picked.cfu} CFU · {picked.context}
								</span>
							</p>
							<Button variant="ghost" size="sm" onClick={back}>
								Cambia
							</Button>
						</div>
					) : (
						<Field label="Nome" htmlFor="new-exam-name">
							<Input
								id="new-exam-name"
								value={name}
								placeholder="Inglese B2"
								onChange={event => setName(event.target.value)}
								className="w-full"
							/>
						</Field>
					)}
					<div className="flex flex-wrap gap-6">
						{manual && (
							<Field label="CFU">
								<Stepper label="CFU" value={cfu} onChange={setCfu} min={1} max={60} />
							</Field>
						)}
						<Field label="Anno" htmlFor="new-exam-year">
							<YearSelect
								id="new-exam-year"
								value={classYear}
								onChange={setClassYear}
								years={yearCount(career)}
							/>
						</Field>
					</div>
					{manual && (
						<>
							<label className="flex items-center gap-2 text-sm">
								<Switch checked={graded} onCheckedChange={setGraded} />
								Ha un voto in trentesimi
							</label>
							<ExternalCheck
								id="new-exam-external"
								checked={external}
								onChange={setExternal}
							/>
						</>
					)}
					{manual && (
						<button
							type="button"
							onClick={back}
							className="text-muted-foreground hover:text-foreground self-start text-sm underline-offset-4 transition-colors hover:underline motion-reduce:transition-none"
						>
							Torna alla ricerca
						</button>
					)}
				</div>
			)}

			<SheetFooter className="mt-auto flex-row justify-end gap-2">
				<Button variant="outline" onClick={onClose}>
					Annulla
				</Button>
				<Button
					disabled={choosing || add.isPending || name.trim() === ""}
					onClick={() =>
						add.mutate(
							{
								name: name.trim(),
								cfu,
								classYear,
								graded: picked ? true : graded,
								classId: picked?.classId ?? null,
								external: !picked && external,
							},
							{ onSuccess: onClose }
						)
					}
				>
					{add.isPending ? (
						<Spinner className="size-4" />
					) : (
						<PlusGlyph className="size-4" />
					)}
					Aggiungi
				</Button>
			</SheetFooter>
		</>
	);
}

/** A year of the plan, or every year at once. */
export type ChoicesScope = number | "all";

/** Picks the exams of the plan's choice groups, for one year or for the whole course. */
export function ChoicesSheet({
	career,
	year,
	onClose,
}: {
	career: Career;
	year: ChoicesScope | undefined;
	onClose: () => void;
}) {
	return (
		<Sheet open={year !== undefined} onOpenChange={open => !open && onClose()}>
			<SheetContent className="flex w-full flex-col gap-5 sm:max-w-lg">
				{year !== undefined && (
					<ChoicesForm key={year} career={career} scope={year} onClose={onClose} />
				)}
			</SheetContent>
		</Sheet>
	);
}

function ChoicesForm({
	career,
	scope,
	onClose,
}: {
	career: Career;
	scope: ChoicesScope;
	onClose: () => void;
}) {
	const save = useSetCareerChoices();
	const groups = career.choiceGroups.filter(
		group => scope === "all" || group.classYear === scope
	);
	const years = [...new Set(groups.map(group => group.classYear))].sort(
		(a, b) => a - b
	);
	const examOf = (planCode: string) =>
		career.exams.find(exam => exam.planCode === planCode);
	const [picked, setPicked] = useState(
		() =>
			new Set(
				groups.flatMap(group =>
					group.options.map(option => option.planCode).filter(code => examOf(code))
				)
			)
	);

	const options = groups.flatMap(group => group.options);
	const inScope = new Set(options.map(option => option.planCode));
	const outside = career.exams
		.filter(exam => !exam.planCode || !inScope.has(exam.planCode))
		.reduce((sum, exam) => sum + exam.cfu, 0);
	const chosen = options
		.filter(option => picked.has(option.planCode))
		.reduce((sum, option) => sum + option.cfu, 0);
	const missing =
		career.course.cfu === null ? null : career.course.cfu - outside - chosen;

	const toggle = (planCode: string, on: boolean) =>
		setPicked(prev => {
			const next = new Set(prev);
			if (on) next.add(planCode);
			else next.delete(planCode);
			return next;
		});

	return (
		<>
			<SheetHeader>
				<SheetTitle>
					Esami a scelta{scope === "all" ? "" : ` · ${yearLabel(scope)}`}
				</SheetTitle>
				<SheetDescription>
					Gli esami spuntati entrano nel libretto come da sostenere.
				</SheetDescription>
			</SheetHeader>
			<div className="-mx-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
				{years.map(year => (
					<div key={year} className="flex flex-col gap-4">
						{scope === "all" && (
							<h3 className="eyebrow text-muted-foreground">{yearLabel(year)}</h3>
						)}
						{groups
							.filter(group => group.classYear === year)
							.map(group => (
								<section key={group.code} className="space-y-2">
									<h4 className="text-sm font-semibold">{choiceLabel(group)}</h4>
									<ul className="divide-border/60 divide-y rounded-xl border">
										{group.options.map(option => {
											const id = `choice-${group.code}-${option.planCode}`;
											const held = examOf(option.planCode);
											const losing =
												held &&
												held.status !== "PLANNED" &&
												!picked.has(option.planCode);
											return (
												<li key={option.planCode}>
													<label
														htmlFor={id}
														className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors motion-reduce:transition-none"
													>
														<Checkbox
															id={id}
															checked={picked.has(option.planCode)}
															onCheckedChange={on =>
																toggle(option.planCode, on === true)
															}
														/>
														<span className="min-w-0 flex-1">
															<span className="block text-sm text-pretty">
																{option.name}
															</span>
															{losing && (
																<span className="text-warning block text-xs">
																	Togliendolo perdi l'esito registrato
																</span>
															)}
														</span>
														<span className="text-muted-foreground text-xs tabular-nums">
															{option.cfu} CFU
														</span>
													</label>
												</li>
											);
										})}
									</ul>
								</section>
							))}
					</div>
				))}
			</div>
			<SheetFooter className="flex-col gap-3 border-t pt-4 sm:flex-col sm:justify-start sm:space-x-0">
				{missing !== null && (
					<p
						role="status"
						className={cn(
							"text-sm tabular-nums",
							missing < 0 ? "text-warning" : "text-muted-foreground"
						)}
					>
						{missing > 0
							? `Scelti ${chosen} CFU · ne mancano ${missing}`
							: missing === 0
								? `Scelti ${chosen} CFU · il corso è completo`
								: `Scelti ${chosen} CFU · ${-missing} oltre il totale`}
					</p>
				)}
				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<SaveButton
						pending={save.isPending}
						onClick={() =>
							save.mutate(
								{
									choices: groups.map(group => ({
										groupCode: group.code,
										planCodes: group.options
											.map(option => option.planCode)
											.filter(code => picked.has(code)),
									})),
								},
								{ onSuccess: onClose }
							)
						}
					>
						Salva le scelte
					</SaveButton>
				</div>
			</SheetFooter>
		</>
	);
}

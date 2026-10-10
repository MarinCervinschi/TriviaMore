import { useState } from "react";

import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { BranchingPathsUpIcon } from "@solar-icons/react/linear/branching-paths-up";
import { RestartIcon } from "@solar-icons/react/linear/restart";

import { CheckGlyph, PlusGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { Career, CareerExam } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

import { GradeRing } from "./career-controls";
import {
	HONOURS_STEP,
	cfuToChoose,
	formatExamDate,
	tafOf,
	yearLabel,
} from "./career-model";
import {
	AddExamSheet,
	type ChoicesScope,
	ChoicesSheet,
	ExamSheet,
} from "./career-sheets";

type Filter = "all" | "open" | "passed";

const isOpen = (exam: CareerExam) => exam.status !== "PASSED";

const matches = (exam: CareerExam, filter: Filter) =>
	filter === "all" ? true : filter === "open" ? isOpen(exam) : !isOpen(exam);

/** Drawn in SVG, because a border colour utility loses to the unlayered `* { border-color }`. */
function OpenMark({ rejected }: { rejected: boolean }) {
	return (
		<span
			className={cn(
				"relative flex size-9 shrink-0 items-center justify-center",
				rejected ? "text-warning" : "text-muted-foreground/50"
			)}
		>
			<svg viewBox="0 0 36 36" className="absolute inset-0" aria-hidden>
				<circle
					cx="18"
					cy="18"
					r="16"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeDasharray="4 4"
				/>
			</svg>
			{rejected && <RestartIcon className="size-4" />}
		</span>
	);
}

function ExamMark({ exam }: { exam: CareerExam }) {
	if (exam.status === "PASSED" && exam.graded && exam.grade !== null) {
		return <GradeRing step={exam.honours ? HONOURS_STEP : exam.grade} />;
	}
	if (exam.status === "PASSED") {
		return (
			<span className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-full">
				<CheckGlyph className="size-4" />
			</span>
		);
	}
	return <OpenMark rejected={exam.status === "REJECTED"} />;
}

function ExamRow({ exam, onOpen }: { exam: CareerExam; onOpen: () => void }) {
	const meta = [
		`${exam.cfu} CFU`,
		!exam.graded && "idoneità",
		exam.external && "altro ateneo",
		exam.status === "REJECTED" &&
			(exam.grade === null ? "rifiutato" : `rifiutato ${exam.grade}`),
		exam.status === "PASSED" && exam.examDate && formatExamDate(exam.examDate),
	].filter(Boolean);

	return (
		<li>
			<button
				type="button"
				onClick={onOpen}
				className="group hover:bg-muted/50 focus-visible:ring-ring flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none"
			>
				<ExamMark exam={exam} />
				<span className="min-w-0 flex-1">
					<span
						className={cn(
							"block text-sm font-medium text-pretty",
							exam.status === "PLANNED" && "text-muted-foreground"
						)}
					>
						{exam.name}
					</span>
					<span
						className={cn(
							"block text-xs tabular-nums",
							exam.status === "REJECTED" ? "text-warning" : "text-muted-foreground"
						)}
					>
						{meta.join(" · ")}
					</span>
				</span>
				<AltArrowRightIcon className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none" />
			</button>
		</li>
	);
}

/** One line for the whole course: the free choices are a total across the years, not one per group. */
function ChoicePrompt({ cfu, onOpen }: { cfu: number; onOpen: () => void }) {
	return (
		<button
			type="button"
			onClick={onOpen}
			className="bg-info/10 hover:bg-info/15 focus-visible:ring-ring ring-info/20 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition-colors ring-inset focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
		>
			<BranchingPathsUpIcon className="text-info size-5 shrink-0" />
			<span className="min-w-0 flex-1 text-sm">
				<span className="block font-medium">
					Ti mancano {cfu} CFU di esami a scelta
				</span>
			</span>
			<span className="text-info flex items-center gap-1 text-sm font-medium">
				Scegli
				<AltArrowRightIcon className="size-4" />
			</span>
		</button>
	);
}

type Kind = "mandatory" | "choice" | "other";

const KINDS: { kind: Kind; title: string }[] = [
	{ kind: "mandatory", title: "Obbligatori" },
	{ kind: "choice", title: "A scelta" },
	{ kind: "other", title: "Altri esami" },
];

const kindOf = (exam: CareerExam): Kind =>
	exam.planCode === null ? "other" : exam.groupCode === null ? "mandatory" : "choice";

const byYear = (a: CareerExam, b: CareerExam) =>
	(a.classYear ?? Infinity) - (b.classYear ?? Infinity) || a.position - b.position;

type Subgroup = { key: string; label: string; exams: CareerExam[] };

/** By year, or for choices by the plan's group, which already carries its year. */
function subgroupsOf(career: Career, kind: Kind, exams: CareerExam[]): Subgroup[] {
	const groups = new Map<string, Subgroup>();
	for (const exam of exams) {
		let key: string;
		let label: string;
		if (kind === "choice") {
			const group = career.choiceGroups.find(row => row.code === exam.groupCode);
			key = `group-${exam.groupCode}`;
			label = group
				? [tafOf(group) ?? "Gruppo a scelta", yearLabel(group.classYear)].join(" · ")
				: "Gruppo a scelta";
		} else {
			key = `year-${exam.classYear ?? "none"}`;
			label = exam.classYear === null ? "Senza anno" : yearLabel(exam.classYear);
		}
		const entry = groups.get(key) ?? { key, label, exams: [] };
		entry.exams.push(exam);
		groups.set(key, entry);
	}
	return [...groups.values()];
}

function KindCard({
	career,
	kind,
	title,
	filter,
	onOpenExam,
	onOpenChoices,
}: {
	career: Career;
	kind: Kind;
	title: string;
	filter: Filter;
	onOpenExam: (exam: CareerExam) => void;
	onOpenChoices: (year: ChoicesScope) => void;
}) {
	const all = career.exams.filter(exam => kindOf(exam) === kind);
	const exams = all.filter(exam => matches(exam, filter)).sort(byYear);
	if (exams.length === 0) return null;

	const total = all.reduce((sum, exam) => sum + exam.cfu, 0);
	const passed = all
		.filter(exam => exam.status === "PASSED")
		.reduce((sum, exam) => sum + exam.cfu, 0);

	return (
		<InsetCard
			title={title}
			actions={
				<div className="flex items-center gap-3">
					{kind === "choice" && career.choiceGroups.length > 0 && (
						<Button variant="ghost" size="sm" onClick={() => onOpenChoices("all")}>
							<BranchingPathsUpIcon className="size-4" />
							Modifica
						</Button>
					)}
					<span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
						{passed} di {total} CFU
					</span>
					<span
						className="bg-success/15 hidden h-1.5 w-24 overflow-hidden rounded-full sm:block"
						aria-hidden
					>
						<span
							className="bg-success block h-full rounded-full"
							style={{ width: `${total ? (passed / total) * 100 : 0}%` }}
						/>
					</span>
				</div>
			}
		>
			<div className="divide-border/60 divide-y">
				{subgroupsOf(career, kind, exams).map(group => (
					<section key={group.key} aria-label={group.label}>
						<header className="bg-muted/40 flex items-baseline justify-between gap-3 px-4 py-1.5">
							<h4 className="eyebrow text-muted-foreground">{group.label}</h4>
							<span className="text-muted-foreground text-xs tabular-nums">
								{group.exams.reduce((sum, exam) => sum + exam.cfu, 0)} CFU
							</span>
						</header>
						<ul className="divide-border/60 divide-y">
							{group.exams.map(exam => (
								<ExamRow key={exam.id} exam={exam} onOpen={() => onOpenExam(exam)} />
							))}
						</ul>
					</section>
				))}
			</div>
		</InsetCard>
	);
}

export function CareerRecord({
	career,
	initialExam,
	initialChoicesYear,
	initialAdding = false,
}: {
	career: Career;
	/** Opens the sheet of this exam, for a story. */
	initialExam?: string;
	initialChoicesYear?: ChoicesScope;
	initialAdding?: boolean;
}) {
	const [filter, setFilter] = useState<Filter>("all");
	const [examId, setExamId] = useState(initialExam);
	const [choicesYear, setChoicesYear] = useState(initialChoicesYear);
	const [adding, setAdding] = useState(initialAdding);
	const open = career.exams.filter(isOpen).length;
	const exam = career.exams.find(row => row.id === examId);
	const visible = career.exams.some(row => matches(row, filter));
	const toChoose = cfuToChoose(career);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<SegmentedControl
					label="Mostra"
					value={filter}
					onChange={setFilter}
					options={[
						{ value: "all", label: "Tutti", count: career.exams.length },
						{ value: "open", label: "Da sostenere", count: open },
						{ value: "passed", label: "Superati", count: career.exams.length - open },
					]}
				/>
				<Button variant="outline" size="sm" onClick={() => setAdding(true)}>
					<PlusGlyph className="size-4" />
					Aggiungi esame
				</Button>
			</div>

			{toChoose > 0 && career.choiceGroups.length > 0 && filter !== "passed" && (
				<ChoicePrompt cfu={toChoose} onOpen={() => setChoicesYear("all")} />
			)}

			{visible ? (
				KINDS.map(item => (
					<KindCard
						key={item.kind}
						career={career}
						{...item}
						filter={filter}
						onOpenExam={row => setExamId(row.id)}
						onOpenChoices={setChoicesYear}
					/>
				))
			) : (
				<InlineEmpty>
					{filter === "passed"
						? "Ancora nessun esame superato."
						: "Nessun esame da sostenere."}
				</InlineEmpty>
			)}

			<ExamSheet career={career} exam={exam} onClose={() => setExamId(undefined)} />
			<ChoicesSheet
				career={career}
				year={choicesYear}
				onClose={() => setChoicesYear(undefined)}
			/>
			<AddExamSheet career={career} open={adding} onClose={() => setAdding(false)} />
		</div>
	);
}

import { type ReactNode, useState } from "react";

import { CalendarMarkIcon } from "@solar-icons/react/linear/calendar-mark";
import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { MagicWandIcon } from "@solar-icons/react/linear/magic-wand";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";
import { PenIcon } from "@solar-icons/react/linear/pen";
import { TuningIcon } from "@solar-icons/react/linear/tuning";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { PlusGlyph, Spinner } from "@/components/icons";
import { CurriculumSelect } from "@/components/onboarding/curriculum-select";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TabNav, type TabNavItem } from "@/components/ui/tab-nav";
import { usePrefillCareer, useSetEnrollment } from "@/lib/crm/mutations";
import type { Career, CurriculumOption } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

import { CareerCourse } from "./career-course";
import { CareerForecast } from "./career-forecast";
import { CareerOverview, type CareerTab } from "./career-overview";
import { CareerRecord } from "./career-record";
import { RulesSheet } from "./career-rules";
import { AddExamSheet, type ChoicesScope } from "./career-sheets";

const TONES = {
	warning: { box: "bg-warning/10 ring-warning/20", icon: "text-warning" },
	info: { box: "bg-info/10 ring-info/20", icon: "text-info" },
} as const;

function Notice({
	icon: Glyph,
	tone,
	title,
	children,
	action,
}: {
	icon: Icon;
	tone: keyof typeof TONES;
	title: string;
	children: ReactNode;
	action?: ReactNode;
}) {
	return (
		<div
			role="status"
			className={cn(
				"flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl px-4 py-3 ring-1 ring-inset",
				TONES[tone].box
			)}
		>
			<Glyph className={cn("size-5 shrink-0", TONES[tone].icon)} aria-hidden />
			<div className="min-w-0 flex-1 basis-60 text-sm">
				<p className="font-medium">{title}</p>
				<p className="text-muted-foreground text-pretty">{children}</p>
			</div>
			{action}
		</div>
	);
}

function PlanNotices({
	career,
	curriculumOptions,
}: {
	career: Career;
	curriculumOptions: CurriculumOption[];
}) {
	const setEnrollment = useSetEnrollment();
	const prefill = usePrefillCareer();

	if (career.planGap === "no-curriculum") {
		return (
			<Notice
				icon={DangerTriangleIcon}
				tone="warning"
				title="Scegli il tuo curriculum"
				action={
					<CurriculumSelect
						options={curriculumOptions}
						value={null}
						disabled={setEnrollment.isPending}
						onChange={curriculumId =>
							setEnrollment.mutate({ courseId: career.course.id, curriculumId })
						}
						className="w-full sm:w-56"
					/>
				}
			>
				Il piano della tua coorte cambia con il curriculum.
			</Notice>
		);
	}
	if (career.planGap === "no-cohort") {
		return (
			<Notice
				icon={CalendarMarkIcon}
				tone="warning"
				title="Manca l'anno di immatricolazione"
				action={
					<Button asChild variant="outline" size="sm">
						<Link to="/onboarding">
							<PenIcon className="size-4" />
							Indicalo
						</Link>
					</Button>
				}
			>
				Senza l'anno non si può precompilare il libretto dal piano.
			</Notice>
		);
	}
	if (career.planGap === "no-plan") {
		return (
			<Notice icon={InfoCircleIcon} tone="info" title="Nessun piano ufficiale">
				Il catalogo non ha il piano della tua coorte. Gli esami si inseriscono a mano.
			</Notice>
		);
	}
	if (career.exams.length > 0 && career.missingMandatory > 0) {
		return (
			<Notice
				icon={InfoCircleIcon}
				tone="info"
				title="Mancano degli esami obbligatori"
				action={
					<Button
						size="sm"
						variant="outline"
						disabled={prefill.isPending}
						onClick={() => prefill.mutate(undefined)}
					>
						{prefill.isPending ? (
							<Spinner className="size-4" />
						) : (
							<MagicWandIcon className="size-4" />
						)}
						Aggiungili
					</Button>
				}
			>
				Il piano ha{" "}
				{career.missingMandatory === 1
					? "un esame obbligatorio"
					: `${career.missingMandatory} esami obbligatori`}{" "}
				che il libretto non ha ancora.
			</Notice>
		);
	}
	return null;
}

function FirstVisit({ career, onManual }: { career: Career; onManual: () => void }) {
	const prefill = usePrefillCareer();
	const canPrefill = career.planGap === null;

	return (
		<EmptyState
			icon={NotebookIcon}
			title="Il tuo libretto è vuoto"
			description={
				canPrefill
					? `Dal piano della coorte ${career.cohort} si aggiungono gli esami obbligatori. Quelli a scelta li scegli dopo.`
					: "Aggiungi gli esami uno alla volta."
			}
		>
			<div className="flex flex-wrap justify-center gap-2">
				{canPrefill && (
					<Button
						className="shadow-primary/25 shadow-lg"
						disabled={prefill.isPending}
						onClick={() => prefill.mutate(undefined)}
					>
						{prefill.isPending ? (
							<Spinner className="size-4" />
						) : (
							<MagicWandIcon className="size-4" />
						)}
						Precompila dal piano
					</Button>
				)}
				<Button variant={canPrefill ? "outline" : "default"} onClick={onManual}>
					<PlusGlyph className="size-4" />
					Inserisci a mano
				</Button>
			</div>
		</EmptyState>
	);
}

/** The frame every Carriera tab shares: the course, the tabs, the plan's warnings and the rules. */
export function CareerShell({
	career,
	tabs,
	curriculumOptions = [],
	initialRules = false,
	children,
}: {
	career: Career;
	tabs: TabNavItem[];
	curriculumOptions?: CurriculumOption[];
	/** Opens the rules sheet, for a story. */
	initialRules?: boolean;
	children: ReactNode;
}) {
	const [rulesOpen, setRulesOpen] = useState(initialRules);
	const [adding, setAdding] = useState(false);
	const empty = career.exams.length === 0;
	const blocked = career.planGap === "no-curriculum" || career.planGap === "no-cohort";

	return (
		<div className="flex flex-col gap-6">
			<PageToolbar
				title="Carriera"
				actions={
					!empty && (
						<Button variant="outline" size="sm" onClick={() => setRulesOpen(true)}>
							<TuningIcon className="size-4" />
							Regole di calcolo
							{!career.settingsSaved && (
								<>
									<span className="bg-warning size-2 rounded-full" aria-hidden />
									<span className="sr-only">, da impostare</span>
								</>
							)}
						</Button>
					)
				}
			/>

			<CareerCourse career={career} />

			{!empty && <TabNav label="Sezioni della carriera" tabs={tabs} />}

			<PlanNotices career={career} curriculumOptions={curriculumOptions} />

			{!empty && !career.settingsSaved && (
				<Notice
					icon={TuningIcon}
					tone="warning"
					title="Regole di calcolo da impostare"
					action={
						<Button variant="outline" size="sm" onClick={() => setRulesOpen(true)}>
							<PenIcon className="size-4" />
							Impostale
						</Button>
					}
				>
					Il voto di laurea per ora si calcola solo dalla media.
				</Notice>
			)}

			{empty
				? !blocked && <FirstVisit career={career} onManual={() => setAdding(true)} />
				: children}

			<RulesSheet
				career={career}
				open={rulesOpen}
				onClose={() => setRulesOpen(false)}
			/>
			<AddExamSheet career={career} open={adding} onClose={() => setAdding(false)} />
		</div>
	);
}

const TABS: { key: CareerTab; label: string }[] = [
	{ key: "overview", label: "Panoramica" },
	{ key: "record", label: "Libretto" },
	{ key: "forecast", label: "Previsione" },
];

/** The whole page with its tabs in local state, for Storybook. */
export function CareerView({
	career,
	initialTab = "overview",
	initialExam,
	initialChoicesYear,
	initialRules,
	initialAdding,
	curriculumOptions,
}: {
	career: Career;
	initialTab?: CareerTab;
	initialExam?: string;
	initialChoicesYear?: ChoicesScope;
	initialAdding?: boolean;
	initialRules?: boolean;
	curriculumOptions?: CurriculumOption[];
}) {
	const [tab, setTab] = useState<CareerTab>(initialTab);

	return (
		<CareerShell
			career={career}
			curriculumOptions={curriculumOptions}
			initialRules={initialRules}
			tabs={TABS.map(item => ({
				key: item.key,
				label: item.label,
				active: tab === item.key,
				onSelect: () => setTab(item.key),
			}))}
		>
			{tab === "overview" && <CareerOverview career={career} onNavigate={setTab} />}
			{tab === "record" && (
				<CareerRecord
					career={career}
					initialExam={initialExam}
					initialChoicesYear={initialChoicesYear}
					initialAdding={initialAdding}
				/>
			)}
			{tab === "forecast" && <CareerForecast career={career} />}
		</CareerShell>
	);
}

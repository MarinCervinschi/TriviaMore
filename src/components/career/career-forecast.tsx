import { useState } from "react";

import { TargetIcon } from "@solar-icons/react/linear/target";

import { TickArc } from "@/components/charts";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { Button } from "@/components/ui/button";
import { InsetCard } from "@/components/ui/inset-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PASS_GRADE, TOP_GRADE, requiredAverage } from "@/lib/crm/career/engine";
import type { Career } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

import { GradeRing, Stepper } from "./career-controls";
import {
	type ForecastSlot,
	GRADUATION_FLOOR,
	HONOURS_STEP,
	forecastSlots,
	forecastSummary,
	formatFigure,
	rulesOf,
	summaryOf,
	yearLabel,
} from "./career-model";

const PRESETS = ["24", "27", "30", "average", "custom"] as const;
type Preset = (typeof PRESETS)[number];

const TARGETS = ["100", "105", "110", "custom"] as const;
type Target = (typeof TARGETS)[number];

const clampStep = (value: number) =>
	Math.max(PASS_GRADE, Math.min(HONOURS_STEP, Math.round(value)));

function SlotRow({
	slot,
	value,
	onChange,
}: {
	slot: ForecastSlot;
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<li className="flex items-center gap-4 px-4 py-2.5">
			<div className="min-w-0 flex-1">
				<p
					className={cn(
						"text-sm font-medium text-pretty",
						slot.placeholder && "text-muted-foreground italic"
					)}
				>
					{slot.name}
				</p>
				<p className="text-muted-foreground text-xs">
					{slot.cfu} CFU ·{" "}
					{slot.placeholder
						? "dai gruppi a scelta del piano"
						: yearLabel(slot.classYear)}
				</p>
			</div>
			<Stepper
				label={`Voto previsto per ${slot.name}`}
				value={value}
				onChange={onChange}
				min={PASS_GRADE}
				max={HONOURS_STEP}
			>
				<GradeRing step={value} size={40} />
			</Stepper>
		</li>
	);
}

function Comparison({
	label,
	before,
	after,
}: {
	label: string;
	before: number | null;
	after: number | null;
}) {
	const delta =
		before === null || after === null ? null : Math.round((after - before) * 100) / 100;
	return (
		<div className="flex items-baseline justify-between gap-3 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="flex items-baseline gap-2 tabular-nums">
				<span className="text-muted-foreground">{formatFigure(before)}</span>→
				<span className="font-semibold">{formatFigure(after)}</span>
				<DeltaBadge value={delta} unit="raw" />
			</span>
		</div>
	);
}

function FinalExamCard({
	career,
	thesis,
	onThesis,
	inCorso,
	onInCorso,
	erasmus,
	onErasmus,
}: {
	career: Career;
	thesis: number;
	onThesis: (value: number) => void;
	inCorso: boolean;
	onInCorso: (value: boolean) => void;
	erasmus: boolean;
	onErasmus: (value: boolean) => void;
}) {
	const rules = career.settings;
	const nothing = rules.thesis + rules.inCorso + rules.erasmus + rules.other === 0;

	return (
		<InsetCard title="La prova finale">
			{nothing ? (
				<p className="text-muted-foreground px-4 py-5 text-sm text-pretty">
					Le regole di calcolo non danno punti alla tesi né bonus.
				</p>
			) : (
				<ul className="divide-border/60 divide-y">
					{rules.thesis > 0 && (
						<li className="flex items-center gap-4 px-4 py-2.5">
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">Tesi</p>
								<p className="text-muted-foreground text-xs">
									fino a {formatFigure(rules.thesis)} punti
								</p>
							</div>
							<Stepper
								label="Punti previsti per la tesi"
								value={thesis}
								onChange={onThesis}
								min={0}
								max={rules.thesis}
								step={0.5}
							>
								<span className="text-sm font-semibold">+{formatFigure(thesis)}</span>
							</Stepper>
						</li>
					)}
					{rules.inCorso > 0 && (
						<li className="flex items-center gap-4 px-4 py-3">
							<label htmlFor="forecast-in-corso" className="min-w-0 flex-1 text-sm">
								<span className="block font-medium">Mi laureo in corso</span>
								<span className="text-muted-foreground block text-xs">
									+{formatFigure(rules.inCorso)} punti
								</span>
							</label>
							<Switch
								id="forecast-in-corso"
								checked={inCorso}
								onCheckedChange={onInCorso}
							/>
						</li>
					)}
					{rules.erasmus > 0 && (
						<li className="flex items-center gap-4 px-4 py-3">
							<label htmlFor="forecast-erasmus" className="min-w-0 flex-1 text-sm">
								<span className="block font-medium">Erasmus</span>
								<span className="text-muted-foreground block text-xs">
									+{formatFigure(rules.erasmus)} punti
								</span>
							</label>
							<Switch
								id="forecast-erasmus"
								checked={erasmus}
								onCheckedChange={onErasmus}
							/>
						</li>
					)}
					{rules.other > 0 && (
						<li className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
							<span className="font-medium">Altri punti</span>
							<span className="tabular-nums">+{formatFigure(rules.other)}</span>
						</li>
					)}
				</ul>
			)}
		</InsetCard>
	);
}

/** Gives every remaining exam a grade and shows where the degree lands. Nothing is saved. */
export function CareerForecast({ career }: { career: Career }) {
	const slots = forecastSlots(career);
	const current = summaryOf(career);
	const startAt = clampStep(current.weightedAverage ?? 27);
	const [grades, setGrades] = useState<Record<string, number>>(() =>
		Object.fromEntries(slots.map(slot => [slot.id, startAt]))
	);
	const [preset, setPreset] = useState<Preset>("average");
	const [customGrade, setCustomGrade] = useState(startAt);
	const [target, setTarget] = useState<Target>("110");
	const [customTarget, setCustomTarget] = useState(108);
	const rules = career.settings;
	const [thesis, setThesis] = useState(rules.thesis);
	const [inCorso, setInCorso] = useState(rules.inCorso > 0);
	const [erasmus, setErasmus] = useState(rules.erasmus > 0);
	const bonuses = {
		thesis,
		inCorso: inCorso ? rules.inCorso : 0,
		erasmus: erasmus ? rules.erasmus : 0,
		other: rules.other,
	};

	const after = forecastSummary(career, grades, bonuses);
	const remainingCfu = slots.reduce((sum, slot) => sum + slot.cfu, 0);
	const goal = requiredAverage({
		exams: career.exams,
		remainingGradedCfu: remainingCfu,
		target: target === "custom" ? customTarget : Number(target),
		bonuses,
		rules: rulesOf(career),
	});

	const setAll = (value: number) =>
		setGrades(Object.fromEntries(slots.map(slot => [slot.id, clampStep(value)])));

	const applyPreset = (next: Preset) => {
		setPreset(next);
		if (next === "custom") setAll(customGrade);
		else setAll(next === "average" ? startAt : Number(next));
	};

	const changeCustomGrade = (value: number) => {
		setCustomGrade(value);
		setAll(value);
	};

	return (
		<div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<div className="flex flex-col gap-6">
				<InsetCard
					title="Gli esami che mancano"
					description="I voti di questa pagina non vengono salvati."
					footer={
						<p className="text-muted-foreground text-xs">
							Le idoneità contano nei CFU e non nella media.
						</p>
					}
				>
					<div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
						<span className="text-muted-foreground mr-auto text-xs">
							Dai a tutti lo stesso voto
						</span>
						<SegmentedControl
							label="Dai a tutti"
							value={preset}
							onChange={applyPreset}
							size="sm"
							options={PRESETS.map(value => ({
								value,
								label:
									value === "average" ? "Media" : value === "custom" ? "Altro" : value,
							}))}
						/>
						{preset === "custom" && (
							<div className="flex">
								<Stepper
									label="Voto per tutti gli esami"
									value={customGrade}
									onChange={changeCustomGrade}
									min={PASS_GRADE}
									max={HONOURS_STEP}
								>
									<GradeRing step={customGrade} size={40} />
								</Stepper>
							</div>
						)}
					</div>
					<ul className="divide-border/60 divide-y">
						{slots.map(slot => (
							<SlotRow
								key={slot.id}
								slot={slot}
								value={grades[slot.id] ?? startAt}
								onChange={value => setGrades(prev => ({ ...prev, [slot.id]: value }))}
							/>
						))}
					</ul>
				</InsetCard>

				<FinalExamCard
					career={career}
					thesis={thesis}
					onThesis={setThesis}
					inCorso={inCorso}
					onInCorso={setInCorso}
					erasmus={erasmus}
					onErasmus={setErasmus}
				/>
			</div>

			<div className="flex flex-col gap-6 lg:sticky lg:top-6">
				<InsetCard title="Con questi voti">
					<div className="flex flex-col gap-4 p-4">
						<TickArc
							value={
								(after.projectedFinal?.rounded ?? GRADUATION_FLOOR) - GRADUATION_FLOOR
							}
							max={110 - GRADUATION_FLOOR}
							label={after.projectedFinal ? String(after.projectedFinal.rounded) : "—"}
							caption="voto di laurea"
							className="mx-auto w-44"
						/>
						<div className="flex flex-col gap-2">
							<Comparison
								label="Media ponderata"
								before={current.weightedAverage}
								after={after.weightedAverage}
							/>
							<Comparison
								label="Base di laurea"
								before={current.base}
								after={after.base}
							/>
							<Comparison
								label="Voto finale"
								before={current.projectedFinal?.rounded ?? null}
								after={after.projectedFinal?.rounded ?? null}
							/>
						</div>
					</div>
				</InsetCard>

				<InsetCard title="Obiettivo">
					<div className="flex flex-col gap-4 p-4">
						<div className="flex flex-wrap items-center gap-3">
							<SegmentedControl
								label="Voto di laurea da raggiungere"
								value={target}
								onChange={setTarget}
								options={TARGETS.map(value => ({
									value,
									label: value === "custom" ? "Altro" : value,
								}))}
							/>
							{target === "custom" && (
								<Stepper
									label="Voto di laurea da raggiungere"
									value={customTarget}
									onChange={setCustomTarget}
									min={GRADUATION_FLOOR}
									max={110}
								/>
							)}
						</div>
						<Separator />
						{goal.status === "possible" && (
							<div className="flex items-end justify-between gap-4">
								<p className="text-sm">
									<span className="block text-3xl font-bold tracking-tight tabular-nums">
										{formatFigure(Math.round(goal.average * 10) / 10)}
									</span>
									<span className="text-muted-foreground">
										di media in {remainingCfu} CFU
									</span>
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setAll(Math.ceil(goal.average))}
								>
									<TargetIcon className="size-4" />
									Applica
								</Button>
							</div>
						)}
						{goal.status === "reached" && (
							<p className="text-sm">
								<span className="text-success block font-semibold">Ci sei già</span>
								<span className="text-muted-foreground">
									Basta un {PASS_GRADE} in ogni esame che manca.
								</span>
							</p>
						)}
						{goal.status === "impossible" && (
							<p className="text-sm">
								<span className="text-warning block font-semibold">Fuori portata</span>
								<span className="text-muted-foreground">
									Nemmeno {TOP_GRADE} in tutti gli esami che mancano basterebbe.
								</span>
							</p>
						)}
					</div>
				</InsetCard>
			</div>
		</div>
	);
}

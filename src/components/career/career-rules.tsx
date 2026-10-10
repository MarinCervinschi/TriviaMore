import { type ReactNode, useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { summarise } from "@/lib/crm/career/engine";
import { useUpdateCareerSettings } from "@/lib/crm/mutations";
import type { CareerSettings } from "@/lib/crm/schemas";
import type { Career } from "@/lib/crm/types";

import { Stepper } from "./career-controls";
import { bonusesOf, formatFigure, rulesOf } from "./career-model";

type NumericKey = Exclude<keyof CareerSettings, "honoursGrade">;

const POINTS: { key: NumericKey; label: string; hint: string; max: number }[] = [
	{
		key: "thesis",
		label: "Tesi, fino a",
		hint: "Il massimo. Nella previsione scegli quanti punti",
		max: 15,
	},
	{
		key: "inCorso",
		label: "Laurea in corso",
		hint: "Entro la durata normale del corso",
		max: 5,
	},
	{
		key: "erasmus",
		label: "Erasmus",
		hint: "Per un periodo di studio all'estero",
		max: 5,
	},
	{
		key: "other",
		label: "Altri punti",
		hint: "Previsti dal regolamento",
		max: 10,
	},
];

const HONOURS = ["30", "31", "32", "33"] as const;

function Row({
	label,
	hint,
	children,
}: {
	label: string;
	hint: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="min-w-0">
				<p className="text-sm font-medium">{label}</p>
				<p className="text-muted-foreground text-xs text-pretty">{hint}</p>
			</div>
			{children}
		</div>
	);
}

/** The grading rules of the student's department. */
export function RulesSheet({
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
			<SheetContent layout="panel" className="sm:max-w-md">
				{open && <RulesForm career={career} onClose={onClose} />}
			</SheetContent>
		</Sheet>
	);
}

function RulesForm({ career, onClose }: { career: Career; onClose: () => void }) {
	const save = useUpdateCareerSettings();
	const [settings, setSettings] = useState(career.settings);
	const set = <K extends keyof CareerSettings>(key: K, value: CareerSettings[K]) =>
		setSettings(prev => ({ ...prev, [key]: value }));

	const before = summarise(career.exams, bonusesOf(career), rulesOf(career));
	const draft = { ...career, settings };
	const after = summarise(career.exams, bonusesOf(draft), rulesOf(draft));

	return (
		<>
			<SheetHeader>
				<SheetTitle>Regole di calcolo</SheetTitle>
				<SheetDescription>
					Sono nel regolamento della prova finale del tuo corso.
				</SheetDescription>
			</SheetHeader>
			<SheetBody className="flex flex-col gap-6">
				{!career.settingsSaved && (
					<p className="bg-warning/10 ring-warning/20 rounded-xl px-3 py-2.5 text-sm text-pretty ring-1 ring-inset">
						<span className="font-medium">Non le hai ancora impostate.</span>{" "}
						<span className="text-muted-foreground">
							Finché non le salvi, il voto di laurea si calcola solo dalla media.
						</span>
					</p>
				)}

				<section className="flex flex-col gap-4">
					<h3 className="text-sm font-semibold">La lode</h3>
					<Row label="Quanto vale nella media" hint="Di solito vale 30">
						<SegmentedControl
							label="Valore della lode"
							value={String(settings.honoursGrade) as (typeof HONOURS)[number]}
							onChange={value => set("honoursGrade", Number(value))}
							size="sm"
							options={HONOURS.map(value => ({ value, label: value }))}
						/>
					</Row>
					<Row label="Punti per ogni lode" hint="Aggiunti alla base di laurea">
						<Stepper
							label="Punti per ogni lode"
							value={settings.honoursBonus}
							onChange={value => set("honoursBonus", value)}
							min={0}
							max={2}
							step={0.25}
						>
							<span className="text-sm font-semibold">
								{formatFigure(settings.honoursBonus)}
							</span>
						</Stepper>
					</Row>
					<Row label="Fino a un massimo di" hint="Il totale dei punti per le lodi">
						<Stepper
							label="Tetto dei punti per le lodi"
							value={settings.honoursBonusCap}
							onChange={value => set("honoursBonusCap", value)}
							min={0}
							max={10}
							step={0.5}
						>
							<span className="text-sm font-semibold">
								{formatFigure(settings.honoursBonusCap)}
							</span>
						</Stepper>
					</Row>
				</section>

				<Separator />

				<section className="flex flex-col gap-4">
					<h3 className="text-sm font-semibold">I punti della commissione</h3>
					{POINTS.map(point => (
						<Row key={point.key} label={point.label} hint={point.hint}>
							<Stepper
								label={point.label}
								value={settings[point.key]}
								onChange={value => set(point.key, value)}
								min={0}
								max={point.max}
								step={0.5}
							>
								<span className="text-sm font-semibold">
									{formatFigure(settings[point.key])}
								</span>
							</Stepper>
						</Row>
					))}
				</section>

				<div className="bg-muted/50 mt-auto flex flex-col gap-1.5 rounded-xl px-4 py-3 text-sm">
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Base di laurea</span>
						<span className="tabular-nums">
							{formatFigure(before.base)} → <strong>{formatFigure(after.base)}</strong>
						</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Voto finale stimato</span>
						<span className="tabular-nums">
							{before.projectedFinal?.rounded ?? "—"} →{" "}
							<strong>{after.projectedFinal?.rounded ?? "—"}</strong>
						</span>
					</div>
				</div>
			</SheetBody>

			<SheetFooter className="flex-row justify-end">
				<Button variant="outline" onClick={onClose}>
					Annulla
				</Button>
				<Button
					disabled={save.isPending}
					onClick={() => save.mutate(settings, { onSuccess: onClose })}
				>
					{save.isPending ? (
						<Spinner className="size-4" />
					) : (
						<DisketteIcon className="size-4" />
					)}
					Salva le regole
				</Button>
			</SheetFooter>
		</>
	);
}

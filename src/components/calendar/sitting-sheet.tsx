import { useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

import { IMPORTANCE_LABEL, type Importance } from "./calendar-model";
import { DateField } from "./date-field";
import { Field, RemoveButton } from "./sheet-fields";

export type SittingDraft = {
	examId: string;
	date: string;
	label: string;
	importance: Importance;
	chosen: boolean;
};

export type SittingExam = { id: string; name: string; cfu: number };

const LABELS = ["Scritto", "Orale", "Prova intermedia"];

/** Adds or edits one appello of an exam in the record. */
export function SittingSheet({
	open,
	exams,
	initial,
	editing = false,
	pending = false,
	onSubmit,
	onRemove,
	onClose,
}: {
	open: boolean;
	exams: SittingExam[];
	initial?: Partial<SittingDraft>;
	editing?: boolean;
	pending?: boolean;
	onSubmit: (draft: SittingDraft) => void;
	onRemove?: () => void;
	onClose: () => void;
}) {
	return (
		<Sheet open={open} onOpenChange={next => !next && onClose()}>
			<SheetContent layout="panel" className="sm:max-w-md">
				{open && (
					<SittingForm
						exams={exams}
						initial={initial}
						editing={editing}
						pending={pending}
						onSubmit={onSubmit}
						onRemove={onRemove}
						onClose={onClose}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}

function SittingForm({
	exams,
	initial,
	editing,
	pending,
	onSubmit,
	onRemove,
	onClose,
}: {
	exams: SittingExam[];
	initial?: Partial<SittingDraft>;
	editing: boolean;
	pending: boolean;
	onSubmit: (draft: SittingDraft) => void;
	onRemove?: () => void;
	onClose: () => void;
}) {
	const [examId, setExamId] = useState(initial?.examId ?? "");
	const [date, setDate] = useState(initial?.date ?? "");
	const [label, setLabel] = useState(initial?.label ?? "");
	const [importance, setImportance] = useState<Importance>(initial?.importance ?? 2);
	const [chosen, setChosen] = useState(initial?.chosen ?? false);
	const exam = exams.find(row => row.id === examId);

	return (
		<>
			<SheetHeader>
				<SheetTitle>
					{editing ? "Modifica l'appello" : "Aggiungi un appello"}
				</SheetTitle>
				<SheetDescription>
					{exam
						? `${exam.name} · ${exam.cfu} CFU`
						: "Una data per un esame del libretto."}
				</SheetDescription>
			</SheetHeader>

			<SheetBody className="flex flex-col gap-6">
				<Field label="Esame" htmlFor="sitting-exam">
					<Select value={examId} onValueChange={setExamId} disabled={editing}>
						<SelectTrigger id="sitting-exam" className="w-full">
							<SelectValue placeholder="Scegli un esame da sostenere" />
						</SelectTrigger>
						<SelectContent>
							{exams.map(row => (
								<SelectItem key={row.id} value={row.id}>
									{row.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				<Field label="Data" htmlFor="sitting-date">
					<DateField id="sitting-date" value={date} onChange={setDate} future />
				</Field>

				<Field label="Prova" htmlFor="sitting-label">
					<Input
						id="sitting-label"
						value={label}
						maxLength={40}
						placeholder="Facoltativo"
						onChange={event => setLabel(event.target.value)}
						className="w-full"
					/>
					<div className="flex flex-wrap gap-1.5">
						{LABELS.map(option => (
							<button
								key={option}
								type="button"
								onClick={() => setLabel(option)}
								aria-pressed={label === option}
								className="bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground focus-visible:ring-ring rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
							>
								{option}
							</button>
						))}
					</div>
				</Field>

				<Field label="Importanza">
					<SegmentedControl
						label="Importanza"
						value={String(importance) as "1" | "2" | "3"}
						onChange={value => setImportance(Number(value) as Importance)}
						options={([1, 2, 3] as const).map(level => ({
							value: String(level) as "1" | "2" | "3",
							label: IMPORTANCE_LABEL[level],
						}))}
					/>
				</Field>

				<label
					htmlFor="sitting-chosen"
					className="flex cursor-pointer items-start gap-3"
				>
					<Switch
						id="sitting-chosen"
						checked={chosen}
						onCheckedChange={setChosen}
						className="mt-0.5"
					/>
					<span className="text-sm">
						<span className="block font-medium">È l'appello che vuoi dare</span>
						<span className="text-muted-foreground block text-xs">
							Gli altri appelli dello stesso esame restano come alternative.
						</span>
					</span>
				</label>
			</SheetBody>

			<SheetFooter className="flex-row">
				{editing && onRemove && (
					<RemoveButton title={"Togliere questo appello?"} onRemove={onRemove} />
				)}
				<Button variant="outline" onClick={onClose} className="ml-auto">
					Annulla
				</Button>
				<Button
					disabled={pending || !examId || !date}
					onClick={() =>
						onSubmit({ examId, date, label: label.trim(), importance, chosen })
					}
				>
					{pending ? (
						<Spinner className="size-4" />
					) : (
						<DisketteIcon className="size-4" />
					)}
					Salva
				</Button>
			</SheetFooter>
		</>
	);
}

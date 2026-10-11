import { useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { EntryColor } from "@/lib/crm/schemas";

import { ENTRY_KINDS } from "./calendar-entry";
import { ColorPicker } from "./color-picker";
import { DateField } from "./date-field";
import { REPEAT_LABELS, type RepeatPreset, buildRule, parseRule } from "./recurrence";
import { ExamSelect, Field, RemoveButton, TimeSelect } from "./sheet-fields";
import type { SittingExam } from "./sitting-sheet";

export type EventDraft = {
	title: string;
	date: string;
	endDate: string | null;
	startTime: string | null;
	endTime: string | null;
	notes: string;
	examId: string | null;
	recurrence: string | null;
	color: EntryColor | null;
};

/** Adds or edits a personal event or note; a note is an event with no time. */
export function EventSheet({
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
	initial?: Partial<EventDraft>;
	editing?: boolean;
	pending?: boolean;
	onSubmit: (draft: EventDraft) => void;
	onRemove?: () => void;
	onClose: () => void;
}) {
	return (
		<Sheet open={open} onOpenChange={next => !next && onClose()}>
			<SheetContent layout="panel" className="sm:max-w-md">
				{open && (
					<EventForm
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

function EventForm({
	exams,
	initial,
	editing,
	pending,
	onSubmit,
	onRemove,
	onClose,
}: {
	exams: SittingExam[];
	initial?: Partial<EventDraft>;
	editing: boolean;
	pending: boolean;
	onSubmit: (draft: EventDraft) => void;
	onRemove?: () => void;
	onClose: () => void;
}) {
	const [title, setTitle] = useState(initial?.title ?? "");
	const [date, setDate] = useState(initial?.date ?? "");
	const [timed, setTimed] = useState(Boolean(initial?.startTime));
	const [startTime, setStartTime] = useState(initial?.startTime ?? null);
	const [endTime, setEndTime] = useState(initial?.endTime ?? null);
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [examId, setExamId] = useState(initial?.examId ?? null);
	const [color, setColor] = useState(initial?.color ?? null);
	const [endDate, setEndDate] = useState(initial?.endDate ?? "");
	const [spans, setSpans] = useState(Boolean(initial?.endDate));
	const parsed = parseRule(initial?.recurrence);
	const [repeat, setRepeat] = useState<RepeatPreset>(parsed.preset);
	const [until, setUntil] = useState(parsed.until);
	const badSpan = spans && Boolean(endDate) && endDate <= date;

	const changeStart = (value: string) => {
		setStartTime(value);
		if (!spans && endTime && endTime <= value) setEndTime(null);
	};

	return (
		<>
			<SheetHeader>
				<SheetTitle>{editing ? "Modifica l'evento" : "Aggiungi un evento"}</SheetTitle>
			</SheetHeader>

			<SheetBody className="flex flex-col gap-6">
				<Field label="Titolo" htmlFor="event-title">
					<Input
						id="event-title"
						value={title}
						maxLength={120}
						placeholder="Ricevimento, gruppo di studio, consegna…"
						onChange={event => setTitle(event.target.value)}
						className="w-full"
					/>
				</Field>

				<Field label="Colore">
					<ColorPicker
						value={color}
						fallback={ENTRY_KINDS.event.defaultColor!}
						onChange={setColor}
					/>
				</Field>

				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-end gap-3">
						<Field label={spans ? "Dal" : "Giorno"} htmlFor="event-date">
							<DateField id="event-date" value={date} onChange={setDate} future />
						</Field>
						{spans && (
							<Field label="Al" htmlFor="event-end-date">
								<DateField
									id="event-end-date"
									value={endDate}
									onChange={setEndDate}
									future
								/>
							</Field>
						)}
					</div>
					<label htmlFor="event-spans" className="flex items-center gap-2 text-sm">
						<Switch
							id="event-spans"
							checked={spans}
							onCheckedChange={next => {
								setSpans(next);
								if (next) setRepeat("none");
							}}
						/>
						Dura più giorni
					</label>
					{badSpan && (
						<p className="text-danger text-xs">
							L'ultimo giorno deve venire dopo il primo.
						</p>
					)}
				</div>

				<div className="flex flex-col gap-3">
					<label htmlFor="event-timed" className="flex items-center gap-2 text-sm">
						<Switch id="event-timed" checked={timed} onCheckedChange={setTimed} />
						Con un orario
					</label>
					{timed && (
						<div className="flex items-center gap-2">
							<TimeSelect
								id="event-start"
								value={startTime}
								onChange={changeStart}
								placeholder="Inizio"
							/>
							<span className="text-muted-foreground text-sm">–</span>
							<TimeSelect
								id="event-end"
								value={endTime}
								onChange={setEndTime}
								after={spans ? null : startTime}
								placeholder="Fine"
							/>
						</div>
					)}
				</div>

				{!spans && (
					<div className="flex flex-wrap items-end gap-3">
						<Field label="Si ripete" htmlFor="event-repeat">
							<Select
								value={repeat}
								onValueChange={value => setRepeat(value as RepeatPreset)}
							>
								<SelectTrigger id="event-repeat" className="w-52">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(REPEAT_LABELS) as RepeatPreset[]).map(preset => (
										<SelectItem key={preset} value={preset}>
											{REPEAT_LABELS[preset]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						{repeat !== "none" && (
							<Field label="Fino al (facoltativo)" htmlFor="event-until">
								<DateField id="event-until" value={until} onChange={setUntil} future />
							</Field>
						)}
					</div>
				)}

				<Field label="Riguarda un esame" htmlFor="event-exam">
					<ExamSelect
						id="event-exam"
						exams={exams}
						value={examId}
						onChange={setExamId}
					/>
				</Field>

				<Field label="Note" htmlFor="event-notes">
					<Textarea
						id="event-notes"
						value={notes}
						maxLength={2000}
						rows={4}
						onChange={event => setNotes(event.target.value)}
						className="w-full"
					/>
				</Field>
			</SheetBody>

			<SheetFooter className="flex-row">
				{editing && onRemove && (
					<RemoveButton
						title={`Togliere «${title.trim() || "l'evento"}»?`}
						onRemove={onRemove}
					/>
				)}
				<Button variant="outline" onClick={onClose} className="ml-auto">
					Annulla
				</Button>
				<Button
					disabled={
						pending ||
						title.trim() === "" ||
						!date ||
						(timed && !startTime) ||
						badSpan ||
						(spans && !endDate)
					}
					onClick={() =>
						onSubmit({
							title: title.trim(),
							date,
							endDate: spans && endDate ? endDate : null,
							recurrence:
								spans || !date ? null : buildRule(repeat, date, until || undefined),
							startTime: timed ? startTime : null,
							endTime: timed ? endTime : null,
							notes: notes.trim(),
							examId,
							color,
						})
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

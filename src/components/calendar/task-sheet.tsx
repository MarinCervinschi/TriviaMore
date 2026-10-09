import { useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ExamSelect, Field, RemoveButton, TimeSelect } from "./sheet-fields";
import type { SittingExam } from "./sitting-sheet";

export type TaskDraft = {
	title: string;
	notes: string;
	dueDate: string;
	dueTime: string | null;
	endTime: string | null;
	done: boolean;
	color: EntryColor | null;
	examId: string | null;
};

/** Adds or edits a task: a to-do on a day, at an hour when it has one. */
export function TaskSheet({
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
	initial?: Partial<TaskDraft>;
	editing?: boolean;
	pending?: boolean;
	onSubmit: (draft: TaskDraft) => void;
	onRemove?: () => void;
	onClose: () => void;
}) {
	return (
		<Sheet open={open} onOpenChange={next => !next && onClose()}>
			<SheetContent layout="panel" className="sm:max-w-md">
				{open && (
					<TaskForm
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

function TaskForm({
	exams,
	initial,
	editing,
	pending,
	onSubmit,
	onRemove,
	onClose,
}: {
	exams: SittingExam[];
	initial?: Partial<TaskDraft>;
	editing: boolean;
	pending: boolean;
	onSubmit: (draft: TaskDraft) => void;
	onRemove?: () => void;
	onClose: () => void;
}) {
	const [title, setTitle] = useState(initial?.title ?? "");
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
	const [timed, setTimed] = useState(Boolean(initial?.dueTime));
	const [dueTime, setDueTime] = useState(initial?.dueTime ?? null);
	const [endTime, setEndTime] = useState(initial?.endTime ?? null);

	const changeStart = (value: string) => {
		setDueTime(value);
		if (endTime && endTime <= value) setEndTime(null);
	};
	const [done, setDone] = useState(initial?.done ?? false);
	const [color, setColor] = useState(initial?.color ?? null);
	const [examId, setExamId] = useState(initial?.examId ?? null);

	return (
		<>
			<SheetHeader>
				<SheetTitle>{editing ? "Modifica la task" : "Aggiungi una task"}</SheetTitle>
			</SheetHeader>

			<SheetBody className="flex flex-col gap-6">
				<Field label="Titolo" htmlFor="task-title">
					<Input
						id="task-title"
						value={title}
						maxLength={200}
						placeholder="Ripassare il capitolo 3"
						onChange={event => setTitle(event.target.value)}
						className="w-full"
					/>
				</Field>

				<Field label="Colore">
					<ColorPicker
						value={color}
						fallback={ENTRY_KINDS.task.defaultColor!}
						onChange={setColor}
					/>
				</Field>

				<div className="flex flex-col gap-3">
					<Field label="Giorno" htmlFor="task-due">
						<DateField id="task-due" value={dueDate} onChange={setDueDate} future />
					</Field>
					<label htmlFor="task-timed" className="flex items-center gap-2 text-sm">
						<Switch id="task-timed" checked={timed} onCheckedChange={setTimed} />
						Con un orario
					</label>
					{timed && (
						<div className="flex items-center gap-2">
							<TimeSelect
								id="task-time"
								value={dueTime}
								onChange={changeStart}
								placeholder="Inizio"
							/>
							<span className="text-muted-foreground text-sm">–</span>
							<TimeSelect
								id="task-end"
								value={endTime}
								onChange={setEndTime}
								after={dueTime}
								placeholder="Fine"
							/>
						</div>
					)}
				</div>

				<label htmlFor="task-done" className="flex items-center gap-2 text-sm">
					<Switch id="task-done" checked={done} onCheckedChange={setDone} />
					Fatta
				</label>

				<Field label="Riguarda un esame" htmlFor="task-exam">
					<ExamSelect
						id="task-exam"
						exams={exams}
						value={examId}
						onChange={setExamId}
					/>
				</Field>

				<Field label="Note" htmlFor="task-notes">
					<Textarea
						id="task-notes"
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
						title={`Togliere «${title.trim() || "la task"}»?`}
						onRemove={onRemove}
					/>
				)}
				<Button variant="outline" onClick={onClose} className="ml-auto">
					Annulla
				</Button>
				<Button
					disabled={pending || title.trim() === "" || !dueDate || (timed && !dueTime)}
					onClick={() =>
						onSubmit({
							title: title.trim(),
							notes: notes.trim(),
							dueDate,
							dueTime: timed ? dueTime : null,
							endTime: timed ? endTime : null,
							done,
							color,
							examId,
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

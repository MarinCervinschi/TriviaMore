import { useState } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { DisketteIcon } from "@solar-icons/react/linear/diskette";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateEvent, useCreateSitting, useCreateTask } from "@/lib/crm/mutations";

import { type EntrySpan, formatDay } from "./calendar-model";
import type { SittingExam } from "./sitting-sheet";

type Kind = "event" | "task" | "sitting";

export type QuickResult =
	| { kind: "event"; title: string; draft: EntrySpan }
	| { kind: "task"; title: string; draft: EntrySpan }
	| { kind: "sitting"; examId: string; draft: EntrySpan };

/** The small dialog a click on the calendar opens: a title and a save, the rest in "Altre opzioni". */
export function QuickCreate({
	draft,
	exams,
	pending,
	onSave,
	onMore,
	onClose,
}: {
	draft: EntrySpan | null;
	exams: SittingExam[];
	pending: boolean;
	onSave: (result: QuickResult) => void;
	onMore: (result: QuickResult) => void;
	onClose: () => void;
}) {
	return (
		<Dialog open={draft !== null} onOpenChange={open => !open && onClose()}>
			<DialogContent className="gap-0 p-0 sm:max-w-md">
				{draft && (
					<QuickForm
						key={`${draft.date}-${draft.time ?? ""}`}
						draft={draft}
						exams={exams}
						pending={pending}
						onSave={onSave}
						onMore={onMore}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function QuickForm({
	draft,
	exams,
	pending,
	onSave,
	onMore,
}: {
	draft: EntrySpan;
	exams: SittingExam[];
	pending: boolean;
	onSave: (result: QuickResult) => void;
	onMore: (result: QuickResult) => void;
}) {
	const [kind, setKind] = useState<Kind>("event");
	const [title, setTitle] = useState("");
	const [examId, setExamId] = useState("");
	const result = (): QuickResult =>
		kind === "sitting"
			? { kind, examId, draft: { date: draft.date } }
			: { kind, title: title.trim(), draft };
	const ready = kind === "sitting" ? examId !== "" : title.trim() !== "";

	const when =
		kind !== "sitting" && draft.time
			? `${formatDay(draft.date)} · ${draft.time}${draft.endTime ? `–${draft.endTime}` : ""}`
			: kind === "event" && draft.endDate
				? `${formatDay(draft.date)} – ${formatDay(draft.endDate)}`
				: `${formatDay(draft.date)} · tutto il giorno`;

	return (
		<form
			className="flex flex-col gap-5 p-6"
			onSubmit={event => {
				event.preventDefault();
				if (ready) onSave(result());
			}}
		>
			<DialogTitle className="sr-only">Nuova voce in calendario</DialogTitle>
			{kind !== "sitting" ? (
				<input
					value={title}
					onChange={event => setTitle(event.target.value)}
					placeholder="Aggiungi un titolo"
					aria-label="Titolo"
					maxLength={kind === "task" ? 200 : 120}
					autoFocus
					className="placeholder:text-muted-foreground w-full bg-transparent pb-1.5 text-xl font-medium shadow-[0_1px_0_0_var(--color-border)] outline-none focus-visible:shadow-[0_2px_0_0_var(--color-primary)]"
				/>
			) : (
				<Select value={examId} onValueChange={setExamId}>
					<SelectTrigger aria-label="Esame" className="w-full">
						<SelectValue placeholder="Scegli un esame da sostenere" />
					</SelectTrigger>
					<SelectContent>
						{exams.map(exam => (
							<SelectItem key={exam.id} value={exam.id}>
								{exam.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			<SegmentedControl
				label="Tipo"
				value={kind}
				onChange={setKind}
				options={[
					{ value: "event", label: "Evento" },
					{ value: "task", label: "Task" },
					...(exams.length > 0
						? [{ value: "sitting" as const, label: "Appello" }]
						: []),
				]}
				className="self-start"
			/>

			<p className="flex items-center gap-2.5 text-sm">
				<ClockCircleIcon className="text-muted-foreground size-4 shrink-0" />
				<span className="first-letter:uppercase">{when}</span>
			</p>

			<div className="flex items-center justify-end gap-2">
				<Button type="button" variant="ghost" onClick={() => onMore(result())}>
					Altre opzioni
				</Button>
				<Button type="submit" disabled={!ready || pending}>
					{pending ? (
						<Spinner className="size-4" />
					) : (
						<DisketteIcon className="size-4" />
					)}
					Salva
				</Button>
			</div>
		</form>
	);
}

/** Saves what the quick create returns, as an event, a task or an appello. */
export function useQuickSave(onSaved: () => void) {
	const createEvent = useCreateEvent();
	const createTask = useCreateTask();
	const createSitting = useCreateSitting();

	const save = (result: QuickResult) => {
		const done = { onSuccess: onSaved };
		if (result.kind === "task") {
			createTask.mutate(
				{
					title: result.title,
					dueDate: result.draft.date,
					dueTime: result.draft.time ?? null,
					endTime: result.draft.time ? (result.draft.endTime ?? null) : null,
				},
				done
			);
		} else if (result.kind === "event") {
			createEvent.mutate(
				{
					title: result.title,
					date: result.draft.date,
					endDate: result.draft.endDate ?? null,
					startTime: result.draft.time ?? null,
					endTime: result.draft.endTime ?? null,
				},
				done
			);
		} else {
			createSitting.mutate(
				{
					examId: result.examId,
					date: result.draft.date,
					importance: 2,
					chosen: false,
				},
				done
			);
		}
	};

	return {
		save,
		pending: createEvent.isPending || createTask.isPending || createSitting.isPending,
	};
}

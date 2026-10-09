import { type ReactNode, useState } from "react";

import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import type { SittingExam } from "./sitting-sheet";

export function Field({
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

/** Every quarter of an hour the calendar grid shows, from 06:00 to 23:45. */
const TIMES = Array.from({ length: 72 }, (_, i) => {
	const minutes = 6 * 60 + i * 15;
	return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** The list, plus a value off the quarter hours (a drag can end at 23:59) so it still shows. */
const times = (value: string | null) =>
	value && !TIMES.includes(value) ? [...TIMES, value].sort() : TIMES;

export function TimeSelect({
	id,
	value,
	onChange,
	after,
	placeholder,
}: {
	id: string;
	value: string | null;
	onChange: (value: string) => void;
	after?: string | null;
	placeholder: string;
}) {
	return (
		<Select value={value ?? undefined} onValueChange={onChange}>
			<SelectTrigger id={id} className="w-28">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="max-h-64">
				{times(value)
					.filter(time => !after || time > after)
					.map(time => (
						<SelectItem key={time} value={time}>
							{time}
						</SelectItem>
					))}
			</SelectContent>
		</Select>
	);
}

const NO_EXAM = "none";

/** The exam an event or a task is for, or none. */
export function ExamSelect({
	id,
	exams,
	value,
	onChange,
}: {
	id: string;
	exams: SittingExam[];
	value: string | null;
	onChange: (value: string | null) => void;
}) {
	return (
		<Select
			value={value ?? NO_EXAM}
			onValueChange={next => onChange(next === NO_EXAM ? null : next)}
		>
			<SelectTrigger id={id} className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={NO_EXAM}>Nessuno</SelectItem>
				{exams.map(exam => (
					<SelectItem key={exam.id} value={exam.id}>
						{exam.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/** The footer's "Togli", behind a confirmation: a removed entry does not come back. */
export function RemoveButton({
	title,
	onRemove,
}: {
	title: string;
	onRemove: () => void;
}) {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			<Button
				variant="ghost"
				className="text-danger hover:text-danger mr-auto"
				onClick={() => setConfirming(true)}
			>
				<TrashBinMinimalisticIcon className="size-4" />
				Togli
			</Button>
			<ConfirmationDialog
				open={confirming}
				onOpenChange={setConfirming}
				title={title}
				description="Non si può annullare."
				confirmText="Togli"
				variant="destructive"
				onConfirm={onRemove}
			/>
		</>
	);
}

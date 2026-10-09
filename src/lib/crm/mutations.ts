import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	addCareerExamFn,
	createEventFn,
	createSittingFn,
	createTaskFn,
	prefillCareerFn,
	removeCareerExamFn,
	removeEventFn,
	removeSittingFn,
	removeTaskFn,
	setCareerChoicesFn,
	setEnrollmentFn,
	updateCareerExamFn,
	updateCareerSettingsFn,
	updateEventFn,
	updateSittingFn,
	updateTaskFn,
} from "./api";
import type {
	AddCareerExamInput,
	CareerSettings,
	CreateEventInput,
	CreateSittingInput,
	CreateTaskInput,
	SetCareerChoicesInput,
	SetEnrollmentInput,
	UpdateCareerExamInput,
	UpdateEventInput,
	UpdateSittingInput,
	UpdateTaskInput,
} from "./schemas";
import type { CalendarData } from "./types";

export function useSetEnrollment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SetEnrollmentInput) => setEnrollmentFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crm"] });
			// The course page opens on the student's own cohort.
			queryClient.invalidateQueries({ queryKey: ["browse", "course"] });
			toast.success("Corso di studi salvato");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

/** The career mutations share one invalidation: every change moves the averages. */
function useCareerMutation<TInput, TOutput>(
	mutationFn: (input: TInput) => Promise<TOutput>,
	successMessage?: (output: TOutput) => string
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn,
		onSuccess: output => {
			queryClient.invalidateQueries({ queryKey: ["crm", "career"] });
			// The calendar shows the record's exams, their names and whether they are passed.
			queryClient.invalidateQueries({ queryKey: ["crm", "calendar"] });
			if (successMessage) toast.success(successMessage(output));
		},
		onError: (error: Error) => toast.error(error.message),
	});
}

export const usePrefillCareer = () =>
	useCareerMutation(
		() => prefillCareerFn(),
		({ added }) =>
			added === 0
				? "Il libretto ha già tutti gli esami obbligatori del piano"
				: `Aggiunti ${added} esami obbligatori dal piano`
	);

export const useAddCareerExam = () =>
	useCareerMutation(
		(data: AddCareerExamInput) => addCareerExamFn({ data }),
		() => "Esame aggiunto"
	);

export const useUpdateCareerExam = () =>
	useCareerMutation(
		(data: UpdateCareerExamInput) => updateCareerExamFn({ data }),
		() => "Esame salvato"
	);

export const useSetCareerChoices = () =>
	useCareerMutation(
		(data: SetCareerChoicesInput) => setCareerChoicesFn({ data }),
		({ added, removed }) => {
			if (added + removed === 0) return "Le scelte erano già queste";
			const parts = [
				added > 0 && (added === 1 ? "un esame aggiunto" : `${added} esami aggiunti`),
				removed > 0 && (removed === 1 ? "un esame tolto" : `${removed} esami tolti`),
			].filter(Boolean);
			const text = parts.join(", ");
			return text.charAt(0).toUpperCase() + text.slice(1);
		}
	);

export const useRemoveCareerExam = () =>
	useCareerMutation(
		(id: string) => removeCareerExamFn({ data: { id } }),
		() => "Esame rimosso"
	);

export const useUpdateCareerSettings = () =>
	useCareerMutation(
		(data: CareerSettings) => updateCareerSettingsFn({ data }),
		() => "Regole di calcolo salvate"
	);

const CALENDAR_KEY = ["crm", "calendar"];

/** A patch field: `undefined` keeps what is there, `null` clears it. */
const keep = <T>(value: T | undefined, current: T) =>
	value === undefined ? current : value;

function useCalendarMutation<TInput, TOutput>(
	mutationFn: (input: TInput) => Promise<TOutput>,
	successMessage?: string,
	/** Applies the change to the cached calendar before the server answers. */
	optimistic?: (data: CalendarData, input: TInput) => CalendarData
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn,
		onMutate: async (input: TInput) => {
			if (!optimistic) return undefined;
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEY });
			const previous = queryClient.getQueryData<CalendarData>(CALENDAR_KEY);
			if (previous) queryClient.setQueryData(CALENDAR_KEY, optimistic(previous, input));
			return { previous };
		},
		onError: (error: Error, _input, context) => {
			if (context?.previous) queryClient.setQueryData(CALENDAR_KEY, context.previous);
			toast.error(error.message);
		},
		onSuccess: () => {
			if (successMessage) toast.success(successMessage);
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: CALENDAR_KEY }),
	});
}

export const useCreateSitting = () =>
	useCalendarMutation(
		(data: CreateSittingInput) => createSittingFn({ data }),
		"Appello aggiunto"
	);

export const useUpdateSitting = (message?: string) =>
	useCalendarMutation(
		(data: UpdateSittingInput) => updateSittingFn({ data }),
		message,
		(calendar, input) => {
			const examId = calendar.sittings.find(row => row.id === input.id)?.examId;
			return {
				...calendar,
				sittings: calendar.sittings.map(row =>
					row.id === input.id
						? {
								...row,
								date: input.date ?? row.date,
								importance: input.importance ?? row.importance,
								chosen: input.chosen ?? row.chosen,
							}
						: input.chosen && row.examId === examId
							? { ...row, chosen: false }
							: row
				),
			};
		}
	);

export const useRemoveSitting = () =>
	useCalendarMutation(
		(id: string) => removeSittingFn({ data: { id } }),
		"Appello tolto"
	);

export const useCreateEvent = () =>
	useCalendarMutation(
		(data: CreateEventInput) => createEventFn({ data }),
		"Evento aggiunto"
	);

export const useUpdateEvent = (message?: string) =>
	useCalendarMutation(
		(data: UpdateEventInput) => updateEventFn({ data }),
		message,
		(calendar, input) => ({
			...calendar,
			events: calendar.events.map(row => {
				if (row.id !== input.id) return row;
				const startTime = keep(input.startTime, row.startTime);
				return {
					...row,
					date: input.date ?? row.date,
					endDate: keep(input.endDate, row.endDate),
					startTime,
					endTime: startTime ? keep(input.endTime, row.endTime) : null,
				};
			}),
		})
	);

export const useRemoveEvent = () =>
	useCalendarMutation((id: string) => removeEventFn({ data: { id } }), "Evento tolto");

export const useCreateTask = () =>
	useCalendarMutation(
		(data: CreateTaskInput) => createTaskFn({ data }),
		"Task aggiunta"
	);

export const useUpdateTask = (message?: string) =>
	useCalendarMutation(
		(data: UpdateTaskInput) => updateTaskFn({ data }),
		message,
		(calendar, input) => ({
			...calendar,
			tasks: calendar.tasks.map(row => {
				if (row.id !== input.id) return row;
				const dueTime = keep(input.dueTime, row.dueTime);
				return {
					...row,
					done: input.done ?? row.done,
					dueDate: input.dueDate ?? row.dueDate,
					dueTime,
					endTime: dueTime ? keep(input.endTime, row.endTime) : null,
				};
			}),
		})
	);

export const useRemoveTask = () =>
	useCalendarMutation((id: string) => removeTaskFn({ data: { id } }), "Task tolta");

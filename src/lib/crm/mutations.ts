import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { track, tracked } from "@/lib/analytics/track";

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
		onSuccess: (_output, data) => {
			track("corso_di_studi", { curriculum: Boolean(data.curriculumId) });
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
		tracked(
			() => prefillCareerFn(),
			(_input, { added }) => track("libretto_precompilato", { esami: added })
		),
		({ added }) =>
			added === 0
				? "Il libretto ha già tutti gli esami obbligatori del piano"
				: `Aggiunti ${added} esami obbligatori dal piano`
	);

export const useAddCareerExam = () =>
	useCareerMutation(
		tracked(
			(data: AddCareerExamInput) => addCareerExamFn({ data }),
			data =>
				track("esame_aggiunto", {
					origine:
						"groupCode" in data
							? "scelta"
							: data.external
								? "esterno"
								: data.classId
									? "catalogo"
									: "manuale",
				})
		),
		() => "Esame aggiunto"
	);

export const useUpdateCareerExam = () =>
	useCareerMutation(
		tracked(
			(data: UpdateCareerExamInput) => updateCareerExamFn({ data }),
			data => {
				if (data.status === "PASSED")
					track("esame_superato", { lode: Boolean(data.honours) });
			}
		),
		() => "Esame salvato"
	);

export const useSetCareerChoices = () =>
	useCareerMutation(
		tracked(
			(data: SetCareerChoicesInput) => setCareerChoicesFn({ data }),
			(_input, { added, removed }) =>
				track("scelte_piano", { aggiunti: added, tolti: removed })
		),
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
		tracked(
			(data: CareerSettings) => updateCareerSettingsFn({ data }),
			() => track("regole_media", {})
		),
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
		tracked(
			(data: CreateSittingInput) => createSittingFn({ data }),
			data =>
				track("appello_aggiunto", { importanza: data.importance, scelto: data.chosen })
		),
		"Appello aggiunto"
	);

export const useUpdateSitting = (message?: string) =>
	useCalendarMutation(
		tracked(
			(data: UpdateSittingInput) => updateSittingFn({ data }),
			data => {
				if (data.chosen) track("appello_scelto", {});
			}
		),
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
		tracked(
			(data: CreateEventInput) => createEventFn({ data }),
			data =>
				track("evento_creato", {
					orario: Boolean(data.startTime),
					piu_giorni: Boolean(data.endDate),
					ricorrente: Boolean(data.recurrence),
					esame: Boolean(data.examId),
				})
		),
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
		tracked(
			(data: CreateTaskInput) => createTaskFn({ data }),
			data =>
				track("task_creata", {
					orario: Boolean(data.dueTime),
					esame: Boolean(data.examId),
				})
		),
		"Task aggiunta"
	);

export const useUpdateTask = (message?: string) =>
	useCalendarMutation(
		tracked(
			(data: UpdateTaskInput) => updateTaskFn({ data }),
			data => {
				if (data.done) track("task_completata", {});
			}
		),
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

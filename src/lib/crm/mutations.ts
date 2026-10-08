import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	addCareerExamFn,
	prefillCareerFn,
	removeCareerExamFn,
	setEnrollmentFn,
	updateCareerExamFn,
	updateCareerSettingsFn,
} from "./api";
import type {
	AddCareerExamInput,
	CareerSettings,
	SetEnrollmentInput,
	UpdateCareerExamInput,
} from "./schemas";

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
	useCareerMutation((data: UpdateCareerExamInput) => updateCareerExamFn({ data }));

export const useRemoveCareerExam = () =>
	useCareerMutation(
		(id: string) => removeCareerExamFn({ data: { id } }),
		() => "Esame rimosso"
	);

export const useUpdateCareerSettings = () =>
	useCareerMutation(
		(data: CareerSettings) => updateCareerSettingsFn({ data }),
		() => "Impostazioni di calcolo salvate"
	);

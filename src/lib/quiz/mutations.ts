import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { quizModeLabel, track } from "@/lib/analytics/track";

import { cancelQuizFn, startQuizFn } from "./api";
import { clearQuizDraft } from "./draft";

export function useStartQuiz(onSuccess?: () => void) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			sectionId: string;
			questionCount: number;
			timeLimit: number | null;
			quizMode: "STUDY" | "EXAM_SIMULATION";
			evaluationModeId?: string;
		}) => startQuizFn({ data }),
		onSuccess: (result, data) => {
			track("quiz_avviato", {
				modalita: quizModeLabel(data.quizMode),
				domande: data.questionCount,
				a_tempo: data.timeLimit !== null,
			});
			queryClient.invalidateQueries({ queryKey: ["quiz", "open-attempt"] });
			onSuccess?.();
			navigate({ to: "/quiz/$quizId", params: { quizId: result.quizId } });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useCancelOpenAttempt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (attemptId: string) =>
			cancelQuizFn({ data: { quizAttemptId: attemptId } }),
		onSuccess: () => {
			track("quiz_annullato", {});
			clearQuizDraft();
			queryClient.invalidateQueries({ queryKey: ["quiz", "open-attempt"] });
			toast.success("Quiz eliminato");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

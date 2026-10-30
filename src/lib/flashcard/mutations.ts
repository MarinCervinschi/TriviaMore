import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { track } from "@/lib/analytics/track";

import { startExamFlashcardFn, startFlashcardFn } from "./api";

export function useStartFlashcard(onSuccess?: () => void) {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (data: { sectionId: string; cardCount: number }) =>
			startFlashcardFn({ data }),
		onSuccess: (result, data) => {
			track("flashcard_avviate", { esame: false, carte: data.cardCount });
			onSuccess?.();
			navigate({
				to: "/flashcard/$sessionId",
				params: { sessionId: result.sessionId },
			});
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useStartExamFlashcard(onSuccess?: () => void) {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (data: { sectionId: string; cardCount: number }) =>
			startExamFlashcardFn({ data }),
		onSuccess: (result, data) => {
			track("flashcard_avviate", { esame: true, carte: data.cardCount });
			onSuccess?.();
			navigate({
				to: "/flashcard/$sessionId",
				params: { sessionId: result.sessionId },
			});
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

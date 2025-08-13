"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface StartFlashcardParams {
	sectionId: string;
	cardCount?: number;
}

const startFlashcardFetch = async (
	params: StartFlashcardParams
): Promise<{ redirectUrl: string }> => {
	const response = await fetch("/api/protected/flashcard/start", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nell'avvio delle flashcard");
	}

	const location = response.headers.get("Location");

	if (!location) {
		throw new Error("Location header mancante nella risposta");
	}

	return { redirectUrl: location };
};

export function useFlashcardMutations() {
	const router = useRouter();

	const startFlashcard = useMutation({
		mutationFn: startFlashcardFetch,
		onSuccess: (data: { redirectUrl: string }) => {
			const { redirectUrl } = data;
			router.push(redirectUrl);
		},
		onError: (error: Error) => {
			console.error("Errore nell'avvio delle flashcard:", error);
			toast.error(error.message || "Errore nell'avvio delle flashcard");
		},
	});

	return {
		startFlashcard,
		isLoading: startFlashcard.isPending,
	};
}

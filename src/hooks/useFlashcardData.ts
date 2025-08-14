"use client";

import { useQuery } from "@tanstack/react-query";

import { FlashcardSession } from "@/lib/types/flashcard.types";
import { getFlashcardSession } from "@/lib/utils/flashcard-session";

interface FlashcardData {
	session: FlashcardSession;
}

const fetchUserFlashcard = async (sessionId: string): Promise<FlashcardData> => {
	try {
		const response = await fetch(`/api/protected/flashcard?sessionId=${sessionId}`);

		if (!response.ok) {
			throw new Error("Errore nel caricamento delle flashcard per l'utente");
		}

		return await response.json();
	} catch (error) {
		throw new Error("Errore nel caricamento delle flashcard per l'utente: " + error);
	}
};

async function loadGuestFlashcard(sessionId: string): Promise<FlashcardData> {
	const sessionData = getFlashcardSession(sessionId);

	if (!sessionData) {
		throw new Error("Sessione flashcard non trovata");
	}

	try {
		const response = await fetch("/api/flashcard/guest", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(sessionData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Errore nel caricamento delle flashcard guest"
			);
		}

		return await response.json();
	} catch (error) {
		throw new Error("Errore nel caricamento delle flashcard guest: " + error);
	}
}

export function useFlashcardData(sessionId: string, isGuest: boolean) {
	return useQuery({
		queryKey: ["flashcard", sessionId, isGuest],
		queryFn: () => {
			if (isGuest) {
				return loadGuestFlashcard(sessionId);
			} else {
				return fetchUserFlashcard(sessionId);
			}
		},
		enabled: !!sessionId,
		staleTime: 5 * 60 * 1000, // 5 minuti
		gcTime: 10 * 60 * 1000, // 10 minuti
		retry: (failureCount, error) => {
			// Non ritentare se è un errore di sessione non trovata
			if (error?.message?.includes("non trovata")) {
				return false;
			}
			return failureCount < 3;
		},
	});
}

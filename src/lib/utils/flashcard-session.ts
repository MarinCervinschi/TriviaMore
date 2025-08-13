import { FlashcardSessionRequest } from "../types/flashcard.types";

interface FlashcardSessionData extends FlashcardSessionRequest {
	timestamp: number;
}

/**
 * Crea una sessione guest per le flashcard e la salva nel localStorage
 */
export function createFlashcardSession(params: FlashcardSessionRequest): string {
	const sessionId = `guest-flashcard-${Date.now()}`;
	const sessionData: FlashcardSessionData = {
		...params,
		timestamp: Date.now(),
	};

	if (typeof window !== "undefined") {
		localStorage.setItem(sessionId, JSON.stringify(sessionData));
	}

	return sessionId;
}

/**
 * Recupera i dati della sessione dal localStorage
 */
export function getFlashcardSession(sessionId: string): FlashcardSessionData | null {
	if (typeof window === "undefined") return null;

	try {
		const data = localStorage.getItem(sessionId);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error("Errore nel recupero della sessione flashcard:", error);
		return null;
	}
}

/**
 * Rimuove la sessione dal localStorage
 */
export function clearFlashcardSession(sessionId: string): void {
	if (typeof window !== "undefined") {
		localStorage.removeItem(sessionId);
	}
}

/**
 * Salva il progresso corrente della sessione
 */
export function saveFlashcardProgress(sessionId: string, currentIndex: number): void {
	if (typeof window === "undefined") return;

	const sessionData = getFlashcardSession(sessionId);
	if (sessionData) {
		const updatedData = {
			...sessionData,
			currentIndex,
			lastAccessed: Date.now(),
		};
		localStorage.setItem(sessionId, JSON.stringify(updatedData));
	}
}

/**
 * Recupera il progresso salvato della sessione
 */
export function getFlashcardProgress(sessionId: string): number {
	if (typeof window === "undefined") return 0;

	const sessionData = getFlashcardSession(sessionId);
	return (sessionData as any)?.currentIndex || 0;
}

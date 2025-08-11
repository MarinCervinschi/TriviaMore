/**
 * Genera un ID breve univoco per quiz guest
 * Formato: guest-{8caratteri}
 */
export function generateShortQuizId(): string {
	const timestamp = Date.now().toString(36); // Base 36 più compatto
	const random = Math.random().toString(36).substring(2, 6); // 4 caratteri casuali
	return `guest-${timestamp}${random}`;
}

/**
 * Crea una sessione temporanea per memorizzare i parametri del quiz
 * Restituisce un ID breve da usare nell'URL
 */
export function createQuizSession(params: {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	evaluationModeId?: string;
}): string {
	const sessionId = generateShortQuizId();

	// Salva in localStorage (per guest) o sessionStorage
	if (typeof window !== "undefined") {
		sessionStorage.setItem(`quiz-session-${sessionId}`, JSON.stringify(params));
	}

	return sessionId;
}

/**
 * Recupera i parametri del quiz dalla sessione
 */
export function getQuizSession(sessionId: string): {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	evaluationModeId?: string;
} | null {
	if (typeof window === "undefined") return null;

	const data = sessionStorage.getItem(`quiz-session-${sessionId}`);
	return data ? JSON.parse(data) : null;
}

/**
 * Pulisce la sessione del quiz
 */
export function clearQuizSession(sessionId: string): void {
	if (typeof window !== "undefined") {
		sessionStorage.removeItem(`quiz-session-${sessionId}`);
	}
}

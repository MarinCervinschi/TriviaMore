/**
 * Utility per avviare un quiz per utenti autenticati
 */

interface StartAuthenticatedQuizParams {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	quizMode: "STUDY" | "EXAM_SIMULATION";
	evaluationModeId: string;
}

/**
 * Avvia un quiz per un utente autenticato e restituisce l'ID del quiz
 */
export async function startAuthenticatedQuiz(
	params: StartAuthenticatedQuizParams
): Promise<{
	quizId: string;
	attemptId: string;
	quiz: any;
}> {
	const response = await fetch("/api/protected/quiz/start", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nell'avvio del quiz");
	}

	const data = await response.json();

	if (!data.quizId || !data.attemptId || !data.quiz) {
		throw new Error("Dati del quiz incompleti ricevuti dal server");
	}

	// Salva automaticamente i dati nel sessionStorage
	saveQuizDataToSession(data.quizId, data.quiz, data.attemptId);

	return {
		quizId: data.quizId,
		attemptId: data.attemptId,
		quiz: data.quiz,
	};
}

/**
 * Salva i dati del quiz nel sessionStorage
 * Questa funzione sarà chiamata dopo aver ricevuto i dati completi del quiz
 */
export function saveQuizDataToSession(
	quizId: string,
	quizData: any,
	attemptId: string
): void {
	if (typeof window !== "undefined") {
		sessionStorage.setItem(
			`quiz_${quizId}`,
			JSON.stringify({
				quiz: quizData,
				attemptId: attemptId,
				timestamp: Date.now(),
			})
		);
	}
}

/**
 * Recupera i dati del quiz dal sessionStorage
 */
export function getQuizDataFromSession(
	quizId: string
): { quiz: any; attemptId: string } | null {
	if (typeof window === "undefined") return null;

	const data = sessionStorage.getItem(`quiz_${quizId}`);
	if (!data) return null;

	try {
		const parsed = JSON.parse(data);
		// Controlla se i dati non sono troppo vecchi (es. 24 ore)
		const maxAge = 24 * 60 * 60 * 1000; // 24 ore in millisecondi
		if (Date.now() - parsed.timestamp > maxAge) {
			sessionStorage.removeItem(`quiz_${quizId}`);
			return null;
		}

		return {
			quiz: parsed.quiz,
			attemptId: parsed.attemptId,
		};
	} catch (error) {
		console.error("Error parsing quiz data from session:", error);
		sessionStorage.removeItem(`quiz_${quizId}`);
		return null;
	}
}

/**
 * Rimuove i dati del quiz dal sessionStorage
 */
export function clearQuizDataFromSession(quizId: string): void {
	if (typeof window !== "undefined") {
		sessionStorage.removeItem(`quiz_${quizId}`);
	}
}

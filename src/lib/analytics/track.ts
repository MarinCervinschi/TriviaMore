// Umami custom events: never anything that names a person (no id, no email, no typed text).

type QuizMode = "studio" | "simulazione";
type AuthMethod = "email" | "google" | "github";

type Events = {
	quiz_avviato: { modalita: QuizMode; domande: number; a_tempo: boolean };
	/** `esito` is the band of the grade out of 30, never the grade itself. */
	quiz_completato: {
		modalita: QuizMode;
		esito: Grade | "sconosciuto";
		traguardi: number;
	};
	quiz_annullato: Record<string, never>;
	flashcard_avviate: { esame: boolean; carte: number };
	flashcard_completate: { carte: number };
	/** For Google and GitHub, the tap: whether the person then finishes is up to the provider. */
	registrazione: { metodo: AuthMethod };
	accesso: { metodo: AuthMethod };
	ricerca_vuota: { ambito: "tutto" | "corsi" | "insegnamenti"; filtri: number };
};

type Grade = "<18" | "18-23" | "24-27" | "28-30" | "lode";

export function gradeBand(score: number): Grade {
	if (score < 18) return "<18";
	if (score < 24) return "18-23";
	if (score < 28) return "24-27";
	if (score <= 30) return "28-30";
	return "lode";
}

export const quizModeLabel = (mode: "STUDY" | "EXAM_SIMULATION"): QuizMode =>
	mode === "STUDY" ? "studio" : "simulazione";

declare global {
	interface Window {
		umami?: { track: (name: string, data?: Record<string, unknown>) => void };
	}
}

/** Does nothing where the script isn't loaded: on the server, in local dev, behind a blocker. */
export function track<Name extends keyof Events>(name: Name, data: Events[Name]) {
	if (typeof window === "undefined") return;
	try {
		window.umami?.track(name, data);
	} catch {
		// Analytics never break the page.
	}
}

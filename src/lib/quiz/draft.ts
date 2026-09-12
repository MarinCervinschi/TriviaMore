import type { UserAnswer } from "./types";

export type QuizDraft = {
	attemptId: string;
	answers: UserAnswer[];
	currentIndex: number;
	elapsedSeconds: number;
};

const KEY = "trivia-more:quiz-draft";

// One attempt can be open at a time, so one slot is enough: a draft naming another
// attempt is stale by construction and gets overwritten rather than merged.

export function readQuizDraft(attemptId: string): QuizDraft | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const draft = JSON.parse(raw) as QuizDraft;
		if (draft?.attemptId !== attemptId || !Array.isArray(draft.answers)) return null;
		return draft;
	} catch {
		return null;
	}
}

export function writeQuizDraft(draft: QuizDraft): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(draft));
	} catch {
		// A blocked or full store costs the resume, not the quiz.
	}
}

export function clearQuizDraft(): void {
	try {
		localStorage.removeItem(KEY);
	} catch {
		// As above.
	}
}

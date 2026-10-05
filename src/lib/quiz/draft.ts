import type { UserAnswer } from "./types";

export type QuizDraft = {
	attemptId: string;
	answers: UserAnswer[];
	currentIndex: number;
	elapsedSeconds: number;
};

const KEY = "trivia-more:quiz-draft";

function isUserAnswer(value: unknown): value is UserAnswer {
	if (typeof value !== "object" || value === null) return false;
	const { questionId, answer } = value as Partial<UserAnswer>;
	return (
		typeof questionId === "string" &&
		Array.isArray(answer) &&
		answer.every(choice => typeof choice === "string")
	);
}

// A slot missing any field is rejected, because a NaN index or clock leaves the attempt open.
export function readQuizDraft(attemptId: string): QuizDraft | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const draft = JSON.parse(raw) as QuizDraft;
		if (draft?.attemptId !== attemptId) return null;
		if (!Number.isFinite(draft.currentIndex)) return null;
		if (!Number.isFinite(draft.elapsedSeconds) || draft.elapsedSeconds < 0) return null;
		if (!Array.isArray(draft.answers) || !draft.answers.every(isUserAnswer))
			return null;
		return draft;
	} catch {
		return null;
	}
}

export function writeQuizDraft(draft: QuizDraft): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(draft));
	} catch {
		// A blocked or full store costs the resume.
	}
}

export function clearQuizDraft(): void {
	try {
		localStorage.removeItem(KEY);
	} catch {
		// A blocked or full store costs the resume.
	}
}

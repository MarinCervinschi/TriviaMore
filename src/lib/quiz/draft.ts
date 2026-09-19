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

function isUserAnswer(value: unknown): value is UserAnswer {
	if (typeof value !== "object" || value === null) return false;
	const { questionId, answer } = value as Partial<UserAnswer>;
	return (
		typeof questionId === "string" &&
		Array.isArray(answer) &&
		answer.every(choice => typeof choice === "string")
	);
}

// Half a draft is worse than none: a missing index or clock reaches the page as
// NaN, which renders no question and submits a `timeSpent` the schema rejects and
// so leaves the attempt open. A slot that does not answer every field is not one.
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

interface QuizSession {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	evaluationModeId?: string;
}

export function generateShortQuizId(): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substring(2, 6);
	return `guest-${timestamp}${random}`;
}

export function createQuizSession(params: QuizSession): string {
	const sessionId = generateShortQuizId();

	if (typeof window !== "undefined") {
		sessionStorage.setItem(`quiz-session-${sessionId}`, JSON.stringify(params));
	}

	return sessionId;
}

export function getQuizSession(sessionId: string): QuizSession | null {
	if (typeof window === "undefined") return null;

	const data = sessionStorage.getItem(`quiz-session-${sessionId}`);
	return data ? JSON.parse(data) : null;
}

export function clearQuizSession(sessionId: string): void {
	if (typeof window !== "undefined") {
		sessionStorage.removeItem(`quiz-session-${sessionId}`);
	}
}

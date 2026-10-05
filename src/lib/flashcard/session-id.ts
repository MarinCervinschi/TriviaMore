// `{mode}.{seed}.{base64url(sectionId:cardCount)}`; the section id is untrusted and gated on every read.

export type FlashcardMode = "user" | "exam";

export type FlashcardSessionId = {
	mode: FlashcardMode;
	seed: number;
	sectionId: string;
	cardCount: number;
};

export function encodeSessionId(session: FlashcardSessionId): string {
	const payload = btoa(`${session.sectionId}:${session.cardCount}`);
	return `${session.mode}.${session.seed}.${payload}`;
}

export function decodeSessionId(raw: string): FlashcardSessionId | null {
	const parts = raw.split(".");
	if (parts.length !== 3) return null;

	const [mode, rawSeed, payload] = parts;
	if (mode !== "user" && mode !== "exam") return null;

	const seed = Number.parseInt(rawSeed, 10);
	if (!Number.isFinite(seed)) return null;

	try {
		const [sectionId, rawCount] = atob(payload).split(":");
		const cardCount = Number.parseInt(rawCount, 10);
		if (!sectionId || !Number.isFinite(cardCount)) return null;
		return { mode, seed, sectionId, cardCount };
	} catch {
		return null;
	}
}

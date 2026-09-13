import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearQuizDraft, readQuizDraft, writeQuizDraft } from "./draft";

function installStorage(): Map<string, string> {
	const store = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (k: string) => store.get(k) ?? null,
		setItem: (k: string, v: string) => void store.set(k, v),
		removeItem: (k: string) => void store.delete(k),
	});
	return store;
}

const DRAFT = {
	attemptId: "attempt-a",
	answers: [
		{ questionId: "q1", answer: ["Vero"] },
		{ questionId: "q2", answer: [] },
	],
	currentIndex: 3,
	elapsedSeconds: 420,
};

describe("the quiz draft slot", () => {
	beforeEach(() => installStorage());
	afterEach(() => vi.unstubAllGlobals());

	it("gives back what it was handed", () => {
		writeQuizDraft(DRAFT);
		expect(readQuizDraft("attempt-a")).toEqual(DRAFT);
	});

	it("keeps the answers and the clock together", () => {
		writeQuizDraft(DRAFT);
		const restored = readQuizDraft("attempt-a");
		expect(restored?.answers[0]?.answer).toEqual(["Vero"]);
		expect(restored?.elapsedSeconds).toBe(420);
		expect(restored?.currentIndex).toBe(3);
	});

	it("refuses a draft belonging to another attempt", () => {
		writeQuizDraft(DRAFT);
		expect(readQuizDraft("attempt-b")).toBeNull();
	});

	it("holds one attempt at a time, the newest", () => {
		writeQuizDraft(DRAFT);
		writeQuizDraft({ ...DRAFT, attemptId: "attempt-b", elapsedSeconds: 5 });

		expect(readQuizDraft("attempt-a")).toBeNull();
		expect(readQuizDraft("attempt-b")?.elapsedSeconds).toBe(5);
	});

	it("is empty after clearing", () => {
		writeQuizDraft(DRAFT);
		clearQuizDraft();
		expect(readQuizDraft("attempt-a")).toBeNull();
	});

	it("reads nothing when nothing was written", () => {
		expect(readQuizDraft("attempt-a")).toBeNull();
	});

	it("survives a corrupt slot", () => {
		installStorage().set("trivia-more:quiz-draft", "{not json");
		expect(readQuizDraft("attempt-a")).toBeNull();
	});

	it.each([
		["no clock", { ...DRAFT, elapsedSeconds: undefined }],
		["a clock that is not a number", { ...DRAFT, elapsedSeconds: "420" }],
		["a clock running backwards", { ...DRAFT, elapsedSeconds: -1 }],
		["no position", { ...DRAFT, currentIndex: undefined }],
		["a position that is not a number", { ...DRAFT, currentIndex: null }],
		["answers that are not answers", { ...DRAFT, answers: [{ questionId: 1 }] }],
	])("refuses a draft with %s", (_, written) => {
		installStorage().set("trivia-more:quiz-draft", JSON.stringify(written));
		expect(readQuizDraft("attempt-a")).toBeNull();
	});

	it("never throws when the store refuses to write", () => {
		vi.stubGlobal("localStorage", {
			getItem: () => null,
			setItem: () => {
				throw new Error("QuotaExceededError");
			},
			removeItem: () => {
				throw new Error("SecurityError");
			},
		});

		expect(() => writeQuizDraft(DRAFT)).not.toThrow();
		expect(() => clearQuizDraft()).not.toThrow();
		expect(readQuizDraft("attempt-a")).toBeNull();
	});
});

import { and, count, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import type { DbOrTx } from "@/db";
import { questions } from "@/db/schema";
import { assertSectionAccess } from "@/lib/auth/checks";
import { FLASHCARD_QUESTION_TYPE } from "@/lib/catalog/db/questions";
import { findSectionChain } from "@/lib/catalog/db/sections";
import { accessibleSectionIdsInClass } from "@/lib/catalog/service";
import { Conflict, NotFound } from "@/lib/server/errors";

import { insertFlashcardAttempt } from "./db/flashcard-attempts";
import { selectRandomItemsWithSeed } from "./randomization";
import type { CompleteFlashcardInput, StartFlashcardInput } from "./schemas";
import { decodeSessionId, encodeSessionId } from "./session-id";
import type { FlashcardMode } from "./session-id";
import type { FlashcardSession } from "./types";

function inSections(sectionIds: string[]) {
	return and(
		inArray(questions.sectionId, sectionIds),
		eq(questions.questionType, FLASHCARD_QUESTION_TYPE)
	);
}

async function countCards(db: DbOrTx, sectionIds: string[]): Promise<number> {
	if (sectionIds.length === 0) return 0;
	const [row] = await db
		.select({ value: count() })
		.from(questions)
		.where(inSections(sectionIds));
	return row?.value ?? 0;
}

async function findCards(db: DbOrTx, sectionIds: string[]) {
	if (sectionIds.length === 0) return [];
	return db
		.select({
			id: questions.id,
			content: questions.content,
			correctAnswer: questions.correctAnswer,
			explanation: questions.explanation,
			difficulty: questions.difficulty,
		})
		.from(questions)
		.where(inSections(sectionIds));
}

// A "user" session draws from one section, an "exam" session from every section
// of the class the user can reach. The sentinel section the exam hangs off is
// itself empty, so it never contributes questions.
async function sourceSections(
	userId: string,
	mode: FlashcardMode,
	sectionId: string
): Promise<string[]> {
	if (mode === "user") return [sectionId];

	const chain = await findSectionChain(getDb(), sectionId);
	if (!chain) return [];
	return accessibleSectionIdsInClass(userId, chain.classId);
}

async function startSession(
	userId: string,
	input: StartFlashcardInput,
	mode: FlashcardMode
): Promise<{ sessionId: string }> {
	const db = getDb();
	await assertSectionAccess(db, userId, input.sectionId);

	const sections = await sourceSections(userId, mode, input.sectionId);
	const available = await countCards(db, sections);
	if (available === 0) {
		throw new Conflict(
			mode === "exam"
				? "Nessuna flashcard disponibile per questa classe"
				: "Nessuna flashcard disponibile per questa sezione"
		);
	}

	return {
		sessionId: encodeSessionId({
			mode,
			seed: Date.now(),
			sectionId: input.sectionId,
			cardCount: Math.min(input.cardCount, available),
		}),
	};
}

export async function startFlashcard(userId: string, input: StartFlashcardInput) {
	return startSession(userId, input, "user");
}

export async function startExamFlashcard(userId: string, input: StartFlashcardInput) {
	return startSession(userId, input, "exam");
}

export async function completeFlashcard(
	userId: string,
	input: CompleteFlashcardInput
): Promise<{ ok: true }> {
	const session = decodeSessionId(input.sessionId);
	if (!session) throw new NotFound("Sessione non trovata");

	const db = getDb();
	await assertSectionAccess(db, userId, session.sectionId);

	// The session id is the idempotency key: its URL is stable, so replaying it
	// must not record a second run — the same reason `claimAttempt` matches on
	// `completed_at is null` for a quiz.
	await insertFlashcardAttempt(db, {
		userId,
		sessionId: input.sessionId,
		sectionId: session.sectionId,
		cardsReviewed: input.cardsReviewed,
	});

	return { ok: true };
}

export async function getFlashcardSession(
	userId: string | null,
	rawSessionId: string
): Promise<FlashcardSession | null> {
	if (!userId) return null;

	const session = decodeSessionId(rawSessionId);
	if (!session) return null;

	// The section id travels in the URL, so this is the gate, not a re-check of
	// something already verified when the session was created.
	const db = getDb();
	await assertSectionAccess(db, userId, session.sectionId);

	const chain = await findSectionChain(db, session.sectionId);
	if (!chain) return null;

	const sections = await sourceSections(userId, session.mode, session.sectionId);
	const pool = await findCards(db, sections);
	if (pool.length === 0) return null;

	const selected = selectRandomItemsWithSeed(pool, session.cardCount, session.seed);

	return {
		id: rawSessionId,
		section: {
			id: chain.sectionId,
			name: chain.sectionName,
			className: chain.className,
			courseName: chain.courseName,
			departmentName: chain.departmentName,
		},
		questions: selected.map((question, index) => ({
			id: question.id,
			content: question.content,
			correctAnswer: question.correctAnswer,
			explanation: question.explanation,
			difficulty: question.difficulty,
			order: index + 1,
		})),
	};
}

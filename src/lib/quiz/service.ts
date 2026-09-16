import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import type { DbOrTx } from "@/db";
import { evaluationModes, questions } from "@/db/schema";
import { applyQuizActivity } from "@/lib/achievements/db/rollups";
import { evaluateAchievementsSafely } from "@/lib/achievements/service";
import type { UnlockedAchievement } from "@/lib/achievements/types";
import { assertSectionAccess } from "@/lib/auth/checks";
import { QUIZ_QUESTION_TYPES } from "@/lib/catalog/db/questions";
import { findSectionById } from "@/lib/catalog/db/sections";
import { sectionBrowsePath } from "@/lib/catalog/paths";
import { accessibleSectionIdsInClass } from "@/lib/catalog/service";
import { log } from "@/lib/logging/server";
import { Conflict, NotFound } from "@/lib/server/errors";

import { evaluationModeColumns } from "./columns";
import {
	applyAttemptGrade,
	claimAttempt,
	deleteAttempt,
	deleteStaleOpenAttempts,
	findAnswers,
	findAttempt,
	findAttemptWithChain,
	findOpenAttemptForUser,
	findSectionAttempts,
	insertAnswers,
	insertAttempt,
	isOpenAttemptViolation,
	touchOpenAttempt,
} from "./db/attempts";
import {
	deleteOrphanQuizzes,
	findQuizQuestionOrder,
	findQuizSectionAndMode,
	findQuizWithChain,
	insertQuiz,
	insertQuizQuestions,
} from "./db/quizzes";
import { selectRandomItems, shuffleArray } from "./randomization";
import type { CompleteQuizInput, StartQuizInput } from "./schemas";
import { THIRTY_SCALE_MAX, calculateAnswerScore } from "./scoring";
import type {
	AttemptHistory,
	EvaluationMode,
	OpenAttempt,
	Quiz,
	QuizAttemptResult,
	QuizQuestion,
} from "./types";

const QUIZ_GONE =
	"Questo quiz non è più disponibile: il contenuto è stato modificato durante la sessione. Le tue risposte non sono state registrate.";

const QUIZ_IN_PROGRESS =
	"Hai già un quiz in corso. Riprendilo o eliminalo prima di iniziarne uno nuovo.";

const ATTEMPT_GONE =
	"Questa sessione non è più disponibile: potrebbe essere stata chiusa o eliminata. Le tue risposte non sono state registrate.";

function findEvaluationMode(db: DbOrTx, id: string) {
	return db
		.select(evaluationModeColumns)
		.from(evaluationModes)
		.where(eq(evaluationModes.id, id))
		.limit(1)
		.then(rows => rows[0]);
}

// The mode a quiz falls back to when the client sends none. Ordered by creation
// so the default is stable instead of whatever the planner returns first.
function findDefaultEvaluationModeId(db: DbOrTx) {
	return db
		.select({ id: evaluationModes.id })
		.from(evaluationModes)
		.orderBy(asc(evaluationModes.createdAt))
		.limit(1)
		.then(rows => rows[0]?.id);
}

function findQuizQuestionPool(db: DbOrTx, sectionIds: string[]) {
	if (sectionIds.length === 0) return Promise.resolve([]);
	return db
		.select({ id: questions.id })
		.from(questions)
		.where(
			and(
				inArray(questions.sectionId, sectionIds),
				inArray(questions.questionType, [...QUIZ_QUESTION_TYPES])
			)
		);
}

function findQuestionsByIds(db: DbOrTx, questionIds: string[]) {
	if (questionIds.length === 0) return Promise.resolve([]);
	return db.select().from(questions).where(inArray(questions.id, questionIds));
}

// "Vero" must stay above "Falso", so only multiple choice gets shuffled.
function shuffleOptions(
	questionType: QuizQuestion["questionType"],
	options: string[] | null
): string[] | null {
	if (!options || questionType === "TRUE_FALSE") return options;
	return shuffleArray(options);
}

// Which sections a run draws from: its own, or every section of the class the
// user can reach when simulating the exam.
async function resolveSourceSections(
	userId: string,
	input: StartQuizInput
): Promise<string[]> {
	if (input.quizMode !== "EXAM_SIMULATION") return [input.sectionId];

	const section = await findSectionById(getDb(), input.sectionId);
	if (!section) throw new NotFound("Sezione non trovata");

	return accessibleSectionIdsInClass(userId, section.classId);
}

/**
 * Discards what this user walked away from: past the horizon an open attempt is
 * scrap holding a quiz nothing can reach. Lazy so it needs no scheduler, and
 * best-effort — failing to take out the rubbish must not block a quiz.
 */
async function reapAbandonedAttempts(userId: string): Promise<void> {
	try {
		await getDb().transaction(async tx => {
			const orphanedQuizzes = await deleteStaleOpenAttempts(tx, userId);
			await deleteOrphanQuizzes(tx, orphanedQuizzes);
		});
	} catch (error) {
		log.error("Reaping abandoned attempts failed", {}, error);
	}
}

type OpenAttemptRow = NonNullable<Awaited<ReturnType<typeof findOpenAttemptForUser>>>;

function toOpenAttempt(row: OpenAttemptRow): OpenAttempt {
	return {
		attemptId: row.attemptId,
		quizId: row.quizId,
		quizMode: row.quizMode,
		startedAt: row.startedAt,
		sectionName: row.sectionName,
		className: row.className,
	};
}

export async function getOpenAttempt(userId: string): Promise<OpenAttempt | null> {
	const db = getDb();
	const attempt = await findOpenAttemptForUser(db, userId);
	if (!attempt) return null;
	if (!attempt.isStale) return toOpenAttempt(attempt);

	// Every screen that offers the attempt back reads through here, and the gate in
	// `startQuiz` is the only other reaper — so without this the student would be
	// shown a quiz the horizon has already written off, with no way past it.
	await reapAbandonedAttempts(userId);
	const remaining = await findOpenAttemptForUser(db, userId);
	return remaining ? toOpenAttempt(remaining) : null;
}

export async function startQuiz(
	userId: string,
	input: StartQuizInput
): Promise<{ quizId: string; attemptId: string }> {
	const db = getDb();

	await assertSectionAccess(db, userId, input.sectionId);

	// Reap before the gate, or an attempt the user forgot about would lock them
	// out of starting anything until they came back and dealt with it by hand.
	await reapAbandonedAttempts(userId);
	if (await findOpenAttemptForUser(db, userId)) throw new Conflict(QUIZ_IN_PROGRESS);

	const evaluationModeId =
		input.evaluationModeId ?? (await findDefaultEvaluationModeId(db));
	if (!evaluationModeId) {
		throw new Conflict("Nessuna modalità di valutazione disponibile");
	}

	const sourceSections = await resolveSourceSections(userId, input);
	const pool = await findQuizQuestionPool(db, sourceSections);
	if (pool.length === 0) {
		throw new Conflict("Nessuna domanda disponibile per il quiz");
	}

	const selected = selectRandomItems(pool, input.questionCount);

	// One transaction: a quiz without its questions, or without the attempt that
	// owns it, is unreachable garbage the user cannot resume or delete.
	try {
		return await db.transaction(async tx => {
			const quiz = await insertQuiz(tx, {
				sectionId: input.sectionId,
				evaluationModeId,
				quizMode: input.quizMode,
				timeLimit: input.timeLimit,
			});

			await insertQuizQuestions(
				tx,
				quiz.id,
				selected.map(question => question.id)
			);

			const attempt = await insertAttempt(tx, { userId, quizId: quiz.id });

			return { quizId: quiz.id, attemptId: attempt.id };
		});
	} catch (error) {
		// The gate above is a read, so two starts racing it both pass; the index is
		// what decides, and this gives its violation the answer the gate would have.
		if (!isOpenAttemptViolation(error)) throw error;
		throw new Conflict(QUIZ_IN_PROGRESS);
	}
}

export async function getQuiz(
	userId: string | null,
	quizId: string
): Promise<Quiz | null> {
	if (!userId) return null;
	const db = getDb();

	const quiz = await findQuizWithChain(db, quizId);
	if (!quiz) return null;

	// quizId comes from the URL, so re-check the section it belongs to rather
	// than trusting that whoever created the quiz is the one fetching it.
	await assertSectionAccess(db, userId, quiz.sectionId);

	const order = await findQuizQuestionOrder(db, quizId);
	if (order.length === 0) return null;

	const [rows, attemptId, evaluationMode] = await Promise.all([
		findQuestionsByIds(
			db,
			order.map(entry => entry.questionId)
		),
		touchOpenAttempt(db, userId, quizId),
		findEvaluationMode(db, quiz.evaluationModeId),
	]);
	if (!evaluationMode) return null;

	const byId = new Map(rows.map(question => [question.id, question]));
	const questionList: QuizQuestion[] = order.flatMap(entry => {
		const question = byId.get(entry.questionId);
		if (!question) return [];
		return [
			{
				id: question.id,
				content: question.content,
				questionType: question.questionType,
				options: shuffleOptions(question.questionType, question.options),
				correctAnswer: question.correctAnswer,
				explanation: question.explanation,
				difficulty: question.difficulty,
				order: entry.order,
			},
		];
	});

	return {
		id: quiz.id,
		timeLimit: quiz.timeLimit,
		quizMode: quiz.quizMode,
		evaluationMode,
		section: {
			id: quiz.sectionId,
			name: quiz.sectionName,
			classId: quiz.classId,
			className: quiz.className,
			courseName: quiz.courseName,
			departmentName: quiz.departmentName,
			departmentCode: quiz.departmentCode,
			courseCode: quiz.courseCode,
			classCode: quiz.classCode,
			path: sectionBrowsePath(quiz),
		},
		questions: questionList,
		attemptId,
	};
}

function gradeAttempt(
	questionRows: (typeof questions.$inferSelect)[],
	submitted: CompleteQuizInput["answers"],
	evaluationMode: EvaluationMode
) {
	const byQuestion = new Map(submitted.map(a => [a.questionId, a.userAnswer]));

	let rawTotal = 0;
	const answers = questionRows.map(question => {
		const userAnswer = byQuestion.get(question.id) ?? [];
		const { score, isCorrect } = calculateAnswerScore(
			userAnswer,
			question.correctAnswer,
			evaluationMode
		);
		rawTotal += score;
		return {
			questionId: question.id,
			userAnswer,
			score,
			isCorrect,
			sectionId: question.sectionId,
			difficulty: question.difficulty,
			questionType: question.questionType,
		};
	});

	const maxScore = questionRows.length * evaluationMode.correctAnswerPoints;
	const score = maxScore > 0 ? Math.round((rawTotal / maxScore) * THIRTY_SCALE_MAX) : 0;
	return { answers, score };
}

export async function completeQuiz(
	userId: string,
	input: CompleteQuizInput
): Promise<{ attemptId: string; unlocked: UnlockedAchievement[] }> {
	const result = await getDb().transaction(async tx => {
		const claimed = await claimAttempt(tx, {
			attemptId: input.quizAttemptId,
			userId,
			timeSpent: input.timeSpent,
		});

		if (!claimed) {
			// Either the attempt is not this user's, does not exist, or a concurrent
			// request already completed it. Only the last is a success, and it has to
			// stay one so a retry lands on the results page; the other two answer
			// alike, so a stranger's id cannot be told apart from a deleted one.
			const existing = await findAttempt(tx, input.quizAttemptId);
			if (existing?.userId !== userId || !existing.completedAt) {
				throw new Conflict(ATTEMPT_GONE);
			}
			return { attemptId: input.quizAttemptId };
		}

		// Grading needs the quiz. Deleting a section cascades its quizzes and nulls
		// this attempt's quiz_id, so returning early here would commit the claim —
		// completed, score 0, no answers — and freeze that into the user's history.
		// Throwing rolls the claim back and leaves the attempt open instead.
		if (!claimed.quizId) throw new Conflict(QUIZ_GONE);

		const quiz = await findQuizSectionAndMode(tx, claimed.quizId);
		if (!quiz) throw new Conflict(QUIZ_GONE);

		const [evaluationMode, order] = await Promise.all([
			findEvaluationMode(tx, quiz.evaluationModeId),
			findQuizQuestionOrder(tx, claimed.quizId),
		]);
		if (!evaluationMode) throw new Conflict(QUIZ_GONE);

		const questionRows = await findQuestionsByIds(
			tx,
			order.map(entry => entry.questionId)
		);
		const graded = gradeAttempt(questionRows, input.answers, evaluationMode);

		await insertAnswers(tx, input.quizAttemptId, graded.answers);
		await applyAttemptGrade(tx, {
			attemptId: input.quizAttemptId,
			score: graded.score,
			sectionId: quiz.sectionId,
			quizMode: quiz.quizMode,
		});

		// In the transaction, not after it: a rollup that can fail independently of
		// the attempt it describes is drift waiting to happen.
		await applyQuizActivity(tx, {
			userId,
			sectionId: quiz.sectionId,
			quizMode: quiz.quizMode,
			score: graded.score,
			timeSpentMs: input.timeSpent ?? 0,
			answers: graded.answers,
		});

		return { attemptId: input.quizAttemptId };
	});

	// Awaited, not fired and forgotten: the unlock is announced in this response.
	// It runs after the commit and cannot throw, so the quiz is never at risk.
	const unlocked = await evaluateAchievementsSafely(userId);

	return { ...result, unlocked };
}

export async function cancelQuiz(userId: string, attemptId: string): Promise<void> {
	await getDb().transaction(async tx => {
		const attempt = await findAttempt(tx, attemptId);
		if (!attempt || attempt.userId !== userId) return;

		await deleteAttempt(tx, attemptId);
		if (attempt.quizId) await deleteOrphanQuizzes(tx, [attempt.quizId]);
	});
}

// Eight columns is what the card can plot without the labels colliding; the tail
// is the part worth reading anyway.
const HISTORY_POINTS = 8;

function buildHistory(
	rows: Awaited<ReturnType<typeof findSectionAttempts>>,
	attemptId: string
): AttemptHistory | null {
	const index = rows.findIndex(row => row.id === attemptId);
	if (index === -1) return null;

	const run = rows.slice(0, index + 1);
	const current = run[index]!;
	const earlier = run.slice(0, index);

	const timed = earlier.filter(row => row.timeSpent != null && row.answers > 0);
	const seconds = timed.reduce((sum, row) => sum + (row.timeSpent ?? 0), 0) / 1000;
	const answers = timed.reduce((sum, row) => sum + row.answers, 0);

	return {
		points: run.slice(-HISTORY_POINTS).map(row => ({
			attemptId: row.id,
			score: row.score,
			completedAt: row.completedAt!,
		})),
		average: run.reduce((sum, row) => sum + row.score, 0) / run.length,
		position: index + 1,
		isPersonalBest:
			earlier.length > 0 && current.score > Math.max(...earlier.map(row => row.score)),
		avgSecondsPerQuestion: answers > 0 ? Math.round(seconds / answers) : null,
	};
}

export async function getQuizResults(
	userId: string | null,
	attemptId: string
): Promise<QuizAttemptResult | null> {
	if (!userId) return null;
	const db = getDb();

	const attempt = await findAttemptWithChain(db, attemptId);
	if (!attempt || attempt.userId !== userId || !attempt.completedAt) return null;

	const order = await findQuizQuestionOrder(db, attempt.quizId);

	const [rows, answers, evaluationMode, sectionAttempts] = await Promise.all([
		findQuestionsByIds(
			db,
			order.map(entry => entry.questionId)
		),
		findAnswers(db, attemptId),
		findEvaluationMode(db, attempt.evaluationModeId),
		attempt.sectionId
			? findSectionAttempts(db, {
					userId,
					sectionId: attempt.sectionId,
					quizMode: attempt.quizMode,
				})
			: Promise.resolve([]),
	]);
	if (!evaluationMode) return null;

	const byId = new Map(rows.map(question => [question.id, question]));

	return {
		id: attempt.id,
		score: attempt.score,
		timeSpent: attempt.timeSpent,
		completedAt: attempt.completedAt,
		isFavorite: attempt.isFavorite,
		quiz: {
			id: attempt.quizId,
			quizMode: attempt.quizMode,
			timeLimit: attempt.timeLimit,
			section: {
				id: attempt.sectionId,
				name: attempt.sectionName,
				classId: attempt.classId,
				className: attempt.className,
				courseName: attempt.courseName,
				departmentName: attempt.departmentName,
				departmentCode: attempt.departmentCode,
				courseCode: attempt.courseCode,
				classCode: attempt.classCode,
				path: sectionBrowsePath(attempt),
			},
			evaluationMode,
			questions: order.flatMap(entry => {
				const question = byId.get(entry.questionId);
				if (!question) return [];
				return [
					{
						id: question.id,
						content: question.content,
						questionType: question.questionType,
						options: question.options,
						correctAnswer: question.correctAnswer,
						explanation: question.explanation,
						difficulty: question.difficulty,
					},
				];
			}),
		},
		answers: answers.map(answer => ({
			...answer,
			isCorrect: answer.isCorrect ?? false,
		})),
		history: buildHistory(sectionAttempts, attempt.id),
	};
}

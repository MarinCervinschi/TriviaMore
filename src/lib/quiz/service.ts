import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import type { DbOrTx } from "@/db";
import { evaluationModes, questions } from "@/db/schema";
import { assertSectionAccess } from "@/lib/auth/checks";
import { QUIZ_QUESTION_TYPES } from "@/lib/catalog/db/questions";
import { findSectionById } from "@/lib/catalog/db/sections";
import { accessibleSectionIdsInClass, sectionBrowsePath } from "@/lib/catalog/service";
import { Conflict, NotFound } from "@/lib/server/errors";

import { evaluationModeColumns } from "./columns";
import {
	applyAttemptGrade,
	claimAttempt,
	countAttempts,
	deleteAttempt,
	findAnswers,
	findAttempt,
	findAttemptWithChain,
	findOpenAttemptId,
	insertAnswers,
	insertAttempt,
} from "./db/attempts";
import {
	deleteQuiz,
	findQuizQuestionOrder,
	findQuizSectionAndMode,
	findQuizWithChain,
	insertQuiz,
	insertQuizQuestions,
} from "./db/quizzes";
import { selectRandomItems, shuffleArray } from "./randomization";
import type { CompleteQuizInput, StartQuizInput } from "./schemas";
import { THIRTY_SCALE_MAX, calculateAnswerScore } from "./scoring";
import type { EvaluationMode, Quiz, QuizAttemptResult, QuizQuestion } from "./types";

const QUIZ_GONE =
	"Questo quiz non è più disponibile: il contenuto è stato modificato durante la sessione. Le tue risposte non sono state registrate.";

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

export async function startQuiz(
	userId: string,
	input: StartQuizInput
): Promise<{ quizId: string; attemptId: string }> {
	const db = getDb();

	await assertSectionAccess(db, userId, input.sectionId);

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
	return db.transaction(async tx => {
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
		findOpenAttemptId(db, userId, quizId),
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
			className: quiz.className,
			courseName: quiz.courseName,
			departmentName: quiz.departmentName,
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
): Promise<{ attemptId: string }> {
	return getDb().transaction(async tx => {
		const claimed = await claimAttempt(tx, {
			attemptId: input.quizAttemptId,
			userId,
			timeSpent: input.timeSpent,
		});

		if (!claimed) {
			// Either the attempt is not this user's, does not exist, or a concurrent
			// request already completed it. Only the last case is a success, and it
			// has to stay one so a retry lands on the results page.
			const existing = await findAttempt(tx, input.quizAttemptId);
			if (!existing || existing.userId !== userId || !existing.completedAt) {
				throw new NotFound("Tentativo non trovato");
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

		return { attemptId: input.quizAttemptId };
	});
}

export async function cancelQuiz(userId: string, attemptId: string): Promise<void> {
	await getDb().transaction(async tx => {
		const attempt = await findAttempt(tx, attemptId);
		if (!attempt || attempt.userId !== userId) return;

		await deleteAttempt(tx, attemptId);

		// A quiz nobody attempted is dead weight: it only exists to be resumed.
		if (attempt.quizId && (await countAttempts(tx, attempt.quizId)) === 0) {
			await deleteQuiz(tx, attempt.quizId);
		}
	});
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

	const [rows, answers, evaluationMode] = await Promise.all([
		findQuestionsByIds(
			db,
			order.map(entry => entry.questionId)
		),
		findAnswers(db, attemptId),
		findEvaluationMode(db, attempt.evaluationModeId),
	]);
	if (!evaluationMode) return null;

	const byId = new Map(rows.map(question => [question.id, question]));

	return {
		id: attempt.id,
		score: attempt.score,
		timeSpent: attempt.timeSpent,
		completedAt: attempt.completedAt,
		quiz: {
			id: attempt.quizId,
			quizMode: attempt.quizMode,
			timeLimit: attempt.timeLimit,
			section: {
				id: attempt.sectionId,
				name: attempt.sectionName,
				className: attempt.className,
				courseName: attempt.courseName,
				departmentName: attempt.departmentName,
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
		answers,
	};
}

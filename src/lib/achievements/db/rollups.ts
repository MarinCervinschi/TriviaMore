import { and, eq, inArray, sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import {
	bookmarks,
	profiles,
	userDayActivity,
	userQuestionStats,
	userSectionStats,
	userStats,
} from "@/db/schema";

import {
	ACTIVITY_ZONE,
	EXAM_MIN_ANSWERS,
	EXAM_PASS_SCORE,
	PERFECT_MIN_ANSWERS,
	PERFECT_SCORE,
} from "../constants";

/**
 * The incremental half of the engine. Every function here runs **inside the
 * transaction that produced the event**: a counter that moves after the commit
 * is a counter that can silently fail to move, and drift in derived state is
 * invisible by construction.
 *
 * Nothing here is authoritative. `recomputeMetricSnapshots` reads the same
 * measures straight from history, and `pnpm achievements:reconcile` is what
 * proves the two agree.
 */

const TODAY = sql`(now() at time zone ${ACTIVITY_ZONE})::date`;

type StatDelta = {
	quizzesCompleted?: number;
	perfectQuizzes?: number;
	examSimsPassed?: number;
	flashcardSessions?: number;
	approvedRequests?: number;
	totalTimeMs?: number;
	hardCorrect?: number;
	bookmarkedThenCorrect?: number;
};

async function addToStats(db: DbOrTx, userId: string, delta: StatDelta) {
	const zero = {
		quizzesCompleted: 0,
		perfectQuizzes: 0,
		examSimsPassed: 0,
		flashcardSessions: 0,
		approvedRequests: 0,
		totalTimeMs: 0,
		hardCorrect: 0,
		bookmarkedThenCorrect: 0,
		...delta,
	};

	await db
		.insert(userStats)
		.values({ userId, ...zero })
		.onConflictDoUpdate({
			target: userStats.userId,
			set: {
				quizzesCompleted: sql`${userStats.quizzesCompleted} + ${zero.quizzesCompleted}`,
				perfectQuizzes: sql`${userStats.perfectQuizzes} + ${zero.perfectQuizzes}`,
				examSimsPassed: sql`${userStats.examSimsPassed} + ${zero.examSimsPassed}`,
				flashcardSessions: sql`${userStats.flashcardSessions} + ${zero.flashcardSessions}`,
				approvedRequests: sql`${userStats.approvedRequests} + ${zero.approvedRequests}`,
				totalTimeMs: sql`${userStats.totalTimeMs} + ${zero.totalTimeMs}`,
				hardCorrect: sql`${userStats.hardCorrect} + ${zero.hardCorrect}`,
				bookmarkedThenCorrect: sql`${userStats.bookmarkedThenCorrect} + ${zero.bookmarkedThenCorrect}`,
				updatedAt: sql`now()`,
			},
		});
}

/** Immutable once written, so this fires once per user and never again. */
async function ensureSignupRank(db: DbOrTx, userId: string) {
	await db.execute(sql`
		update ${profiles} p
		   set signup_rank = (
		         select count(*) from ${profiles} earlier
		          where (earlier.created_at, earlier.id) <= (p.created_at, p.id)
		       )
		 where p.id = ${userId} and p.signup_rank is null
	`);
}

async function markActiveDay(db: DbOrTx, userId: string, kind: "quiz" | "flashcard") {
	await db
		.insert(userDayActivity)
		.values({
			userId,
			day: TODAY as unknown as string,
			quizzes: kind === "quiz" ? 1 : 0,
			flashcards: kind === "flashcard" ? 1 : 0,
		})
		.onConflictDoUpdate({
			target: [userDayActivity.userId, userDayActivity.day],
			set:
				kind === "quiz"
					? { quizzes: sql`${userDayActivity.quizzes} + 1` }
					: { flashcards: sql`${userDayActivity.flashcards} + 1` },
		});
}

/**
 * Flips a flag on the question set and reports how many questions it actually
 * turned on. `setWhere` is what makes the count truthful: a question already
 * marked is not returned, so the counter never double-counts a replay.
 */
async function markQuestions(
	db: DbOrTx,
	userId: string,
	questionIds: string[],
	flag: "hardCorrect" | "bookmarkedThenCorrect"
): Promise<number> {
	if (questionIds.length === 0) return 0;

	const column =
		flag === "hardCorrect"
			? userQuestionStats.hardCorrect
			: userQuestionStats.bookmarkedThenCorrect;

	const marked = await db
		.insert(userQuestionStats)
		.values(questionIds.map(questionId => ({ userId, questionId, [flag]: true })))
		.onConflictDoUpdate({
			target: [userQuestionStats.userId, userQuestionStats.questionId],
			set: { [flag]: true },
			setWhere: eq(column, false),
		})
		.returning({ questionId: userQuestionStats.questionId });

	return marked.length;
}

export type QuizActivity = {
	userId: string;
	sectionId: string;
	quizMode: string | null;
	score: number;
	timeSpentMs: number;
	answers: {
		questionId: string | null;
		isCorrect: boolean | null;
		difficulty: string | null;
	}[];
};

export async function applyQuizActivity(db: DbOrTx, activity: QuizActivity) {
	const { userId, score, answers } = activity;
	const answered = answers.length;

	const correctIds = answers
		.filter(answer => answer.isCorrect && answer.questionId)
		.map(answer => answer.questionId!);
	const hardIds = answers
		.filter(
			answer => answer.isCorrect && answer.difficulty === "HARD" && answer.questionId
		)
		.map(answer => answer.questionId!);

	// Any bookmark that exists now was made before this attempt finished, which is
	// exactly what the recompute's `b.created_at < a.completed_at` means.
	const bookmarkedFirst =
		correctIds.length === 0
			? []
			: await db
					.select({ questionId: bookmarks.questionId })
					.from(bookmarks)
					.where(
						and(eq(bookmarks.userId, userId), inArray(bookmarks.questionId, correctIds))
					);

	// Sequential, not Promise.all: these share one transaction, and a transaction
	// is one connection — concurrent statements on it interleave or throw.
	const hardCorrect = await markQuestions(db, userId, hardIds, "hardCorrect");
	const bookmarkedThenCorrect = await markQuestions(
		db,
		userId,
		bookmarkedFirst.map(row => row.questionId),
		"bookmarkedThenCorrect"
	);

	await db
		.insert(userSectionStats)
		.values({
			userId,
			sectionId: activity.sectionId,
			runs: 1,
			firstScore: score,
			lastScore: score,
			firstAt: sql`now()` as unknown as string,
			lastAt: sql`now()` as unknown as string,
		})
		.onConflictDoUpdate({
			// first_score and first_at are left alone on purpose: they are what an
			// improvement is measured from.
			target: [userSectionStats.userId, userSectionStats.sectionId],
			set: {
				runs: sql`${userSectionStats.runs} + 1`,
				lastScore: score,
				lastAt: sql`now()`,
			},
		});

	await markActiveDay(db, userId, "quiz");

	await addToStats(db, userId, {
		quizzesCompleted: 1,
		perfectQuizzes: score >= PERFECT_SCORE && answered >= PERFECT_MIN_ANSWERS ? 1 : 0,
		examSimsPassed:
			activity.quizMode === "EXAM_SIMULATION" &&
			score >= EXAM_PASS_SCORE &&
			answered >= EXAM_MIN_ANSWERS
				? 1
				: 0,
		totalTimeMs: activity.timeSpentMs,
		hardCorrect,
		bookmarkedThenCorrect,
	});

	await ensureSignupRank(db, userId);
}

export async function applyFlashcardActivity(db: DbOrTx, userId: string) {
	await markActiveDay(db, userId, "flashcard");
	await addToStats(db, userId, { flashcardSessions: 1 });
	await ensureSignupRank(db, userId);
}

export async function applyApprovedRequest(db: DbOrTx, userId: string) {
	await addToStats(db, userId, { approvedRequests: 1 });
	await ensureSignupRank(db, userId);
}

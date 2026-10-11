import { and, asc, count, desc, eq, isNotNull, isNull, lt, sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { answerAttempts, classes, quizAttempts, quizzes, sections } from "@/db/schema";
import { primaryCourseByClass } from "@/lib/catalog/db/course-classes";
import { sectionLocation } from "@/lib/catalog/db/section-location";

import { ABANDONED_ATTEMPT_TTL_HOURS } from "../constants";

const ABANDONED_BEFORE = sql`now() - make_interval(hours => ${ABANDONED_ATTEMPT_TTL_HOURS}::int)`;

/** Whether an insert lost the race for the user's one open attempt; the SQLSTATE is on the cause. */
export function isOpenAttemptViolation(error: unknown): boolean {
	for (let cause: unknown = error, depth = 0; cause && depth < 4; depth++) {
		if (typeof cause !== "object") return false;
		const { code, constraint } = cause as { code?: string; constraint?: string };
		if (code === "23505" && constraint === "idx_quiz_attempts_user_open") return true;
		cause = (cause as { cause?: unknown }).cause;
	}
	return false;
}

export async function insertAttempt(
	db: DbOrTx,
	values: { userId: string; quizId: string }
) {
	const [attempt] = await db
		.insert(quizAttempts)
		.values({ ...values, score: 0 })
		.returning({ id: quizAttempts.id });
	return attempt;
}

/** The open attempt, marked as seen in the same round trip. */
export async function touchOpenAttempt(db: DbOrTx, userId: string, quizId: string) {
	const [attempt] = await db
		.update(quizAttempts)
		.set({ lastSeenAt: sql`now()` })
		.where(
			and(
				eq(quizAttempts.quizId, quizId),
				eq(quizAttempts.userId, userId),
				isNull(quizAttempts.completedAt)
			)
		)
		.returning({ id: quizAttempts.id });
	return attempt?.id;
}

/** The user's unfinished attempt; one whose quiz was deleted is left out. */
export async function findOpenAttemptForUser(db: DbOrTx, userId: string) {
	const [attempt] = await db
		.select({
			attemptId: quizAttempts.id,
			quizId: quizzes.id,
			quizMode: quizzes.quizMode,
			startedAt: quizAttempts.startedAt,
			sectionName: sections.name,
			className: classes.name,
			isStale: sql<boolean>`${quizAttempts.lastSeenAt} < ${ABANDONED_BEFORE}`,
		})
		.from(quizAttempts)
		.innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
		.innerJoin(sections, eq(sections.id, quizzes.sectionId))
		.innerJoin(classes, eq(classes.id, sections.classId))
		.where(and(eq(quizAttempts.userId, userId), isNull(quizAttempts.completedAt)))
		.orderBy(desc(quizAttempts.startedAt))
		.limit(1);

	return attempt;
}

export async function findAttempt(db: DbOrTx, attemptId: string) {
	const [attempt] = await db
		.select({
			id: quizAttempts.id,
			userId: quizAttempts.userId,
			quizId: quizAttempts.quizId,
			completedAt: quizAttempts.completedAt,
		})
		.from(quizAttempts)
		.where(eq(quizAttempts.id, attemptId))
		.limit(1);
	return attempt;
}

export async function claimAttempt(
	db: DbOrTx,
	params: {
		attemptId: string;
		userId: string;
		timeSpent: number;
	}
) {
	const [claimed] = await db
		.update(quizAttempts)
		.set({
			timeSpent: params.timeSpent,
			completedAt: sql`now()`,
		})
		.where(
			and(
				eq(quizAttempts.id, params.attemptId),
				eq(quizAttempts.userId, params.userId),
				isNull(quizAttempts.completedAt)
			)
		)
		.returning({ id: quizAttempts.id, quizId: quizAttempts.quizId });

	return claimed;
}

export async function applyAttemptGrade(
	db: DbOrTx,
	params: {
		attemptId: string;
		score: number;
		sectionId: string;
		quizMode: (typeof quizAttempts.$inferInsert)["quizMode"];
	}
) {
	await db
		.update(quizAttempts)
		.set({
			score: params.score,
			sectionId: params.sectionId,
			quizMode: params.quizMode,
		})
		.where(eq(quizAttempts.id, params.attemptId));
}

export async function deleteAttempt(db: DbOrTx, attemptId: string) {
	await db.delete(quizAttempts).where(eq(quizAttempts.id, attemptId));
}

export async function deleteStaleOpenAttempts(
	db: DbOrTx,
	userId: string
): Promise<string[]> {
	const reaped = await db
		.delete(quizAttempts)
		.where(
			and(
				eq(quizAttempts.userId, userId),
				isNull(quizAttempts.completedAt),
				lt(quizAttempts.lastSeenAt, ABANDONED_BEFORE)
			)
		)
		.returning({ quizId: quizAttempts.quizId });

	return [...new Set(reaped.flatMap(row => (row.quizId ? [row.quizId] : [])))];
}

export async function insertAnswers(
	db: DbOrTx,
	attemptId: string,
	answers: {
		questionId: string;
		userAnswer: string[];
		score: number;
		isCorrect: boolean;
		sectionId: string;
		difficulty: NonNullable<(typeof answerAttempts.$inferInsert)["difficulty"]>;
		questionType: NonNullable<(typeof answerAttempts.$inferInsert)["questionType"]>;
	}[]
) {
	if (answers.length === 0) return;
	await db.insert(answerAttempts).values(
		answers.map(answer => ({
			quizAttemptId: attemptId,
			questionId: answer.questionId,
			userAnswer: answer.userAnswer,
			score: answer.score,
			isCorrect: answer.isCorrect,
			sectionId: answer.sectionId,
			difficulty: answer.difficulty,
			questionType: answer.questionType,
		}))
	);
}

export async function findAnswers(db: DbOrTx, attemptId: string) {
	const rows = await db
		.select({
			questionId: answerAttempts.questionId,
			userAnswer: answerAttempts.userAnswer,
			score: answerAttempts.score,
			isCorrect: answerAttempts.isCorrect,
		})
		.from(answerAttempts)
		.where(
			and(
				eq(answerAttempts.quizAttemptId, attemptId),
				isNotNull(answerAttempts.questionId)
			)
		);
	return rows.map(row => ({ ...row, questionId: row.questionId! }));
}

/** Completed attempts, newest first; left joins keep an attempt whose section was deleted. */
export async function findCompletedAttemptHistory(
	db: DbOrTx,
	userId: string,
	scope?: { level: "section" | "class" | "course"; id: string },
	limit?: number
) {
	const { primaryCourse, columns } = sectionLocation(db);

	const scoped =
		scope?.level === "section"
			? eq(quizAttempts.sectionId, scope.id)
			: scope?.level === "class"
				? eq(sections.classId, scope.id)
				: scope?.level === "course"
					? eq(primaryCourse.courseId, scope.id)
					: undefined;

	return db
		.select({
			...columns,
			classCode: primaryCourse.classCode,
			courseCode: primaryCourse.courseCode,
			departmentCode: primaryCourse.departmentCode,
			id: quizAttempts.id,
			// Null once the quiz is gone.
			quizId: quizAttempts.quizId,
			score: quizAttempts.score,
			timeSpent: quizAttempts.timeSpent,
			quizMode: quizAttempts.quizMode,
			completedAt: quizAttempts.completedAt,
			isFavorite: quizAttempts.isFavorite,
		})
		.from(quizAttempts)
		.leftJoin(sections, eq(sections.id, quizAttempts.sectionId))
		.leftJoin(classes, eq(classes.id, sections.classId))
		.leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
		.where(
			and(eq(quizAttempts.userId, userId), isNotNull(quizAttempts.completedAt), scoped)
		)
		.orderBy(desc(quizAttempts.completedAt))
		.limit(limit ?? Number.MAX_SAFE_INTEGER);
}

export async function findAttemptWithChain(db: DbOrTx, attemptId: string) {
	const primaryCourse = primaryCourseByClass(db);

	const [attempt] = await db
		.select({
			id: quizAttempts.id,
			userId: quizAttempts.userId,
			score: quizAttempts.score,
			timeSpent: quizAttempts.timeSpent,
			completedAt: quizAttempts.completedAt,
			isFavorite: quizAttempts.isFavorite,
			quizId: quizzes.id,
			quizMode: quizzes.quizMode,
			timeLimit: quizzes.timeLimit,
			evaluationModeId: quizzes.evaluationModeId,
			sectionId: sections.id,
			sectionName: sections.name,
			sectionSlug: sections.slug,
			classId: classes.id,
			className: classes.name,
			classCode: primaryCourse.classCode,
			courseName: primaryCourse.courseName,
			courseCode: primaryCourse.courseCode,
			departmentName: primaryCourse.departmentName,
			departmentCode: primaryCourse.departmentCode,
		})
		.from(quizAttempts)
		.innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
		.innerJoin(sections, eq(sections.id, quizzes.sectionId))
		.innerJoin(classes, eq(classes.id, sections.classId))
		.leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
		.where(eq(quizAttempts.id, attemptId))
		.limit(1);

	return attempt;
}

/** Oldest first, filtered by mode because a timed simulation and a study run measure different things. */
export async function findSectionAttempts(
	db: DbOrTx,
	params: {
		userId: string;
		sectionId: string;
		quizMode: (typeof quizAttempts.$inferSelect)["quizMode"];
	}
) {
	return db
		.select({
			id: quizAttempts.id,
			score: quizAttempts.score,
			timeSpent: quizAttempts.timeSpent,
			completedAt: quizAttempts.completedAt,
			answers: count(answerAttempts.id),
		})
		.from(quizAttempts)
		.leftJoin(answerAttempts, eq(answerAttempts.quizAttemptId, quizAttempts.id))
		.where(
			and(
				eq(quizAttempts.userId, params.userId),
				eq(quizAttempts.sectionId, params.sectionId),
				isNotNull(quizAttempts.completedAt),
				params.quizMode
					? eq(quizAttempts.quizMode, params.quizMode)
					: isNull(quizAttempts.quizMode)
			)
		)
		.groupBy(quizAttempts.id)
		.orderBy(asc(quizAttempts.completedAt));
}

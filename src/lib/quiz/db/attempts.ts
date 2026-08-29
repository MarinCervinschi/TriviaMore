import { and, count, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { answerAttempts, classes, quizAttempts, quizzes, sections } from "@/db/schema";
import { primaryCourseByClass } from "@/lib/catalog/db/course-classes";
import { sectionLocation } from "@/lib/catalog/db/section-location";

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

export async function findOpenAttemptId(db: DbOrTx, userId: string, quizId: string) {
	const [attempt] = await db
		.select({ id: quizAttempts.id })
		.from(quizAttempts)
		.where(
			and(
				eq(quizAttempts.quizId, quizId),
				eq(quizAttempts.userId, userId),
				isNull(quizAttempts.completedAt)
			)
		)
		.limit(1);
	return attempt?.id;
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

export async function countAttempts(db: DbOrTx, quizId: string) {
	const [row] = await db
		.select({ value: count() })
		.from(quizAttempts)
		.where(eq(quizAttempts.quizId, quizId));
	return row?.value ?? 0;
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

// The user dashboard's "recent activity". Lives here because it reads quiz
// tables, even though the user domain is what renders it.
/**
 * Every completed attempt, newest first, optionally scoped and capped. The joins
 * are left joins on purpose: an attempt whose section was deleted still happened,
 * and the row has to survive it — the callers render it as "sezione eliminata".
 */
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
			// Null once the quiz is gone, which is what makes the result page
			// unreachable — the row survives, its result does not.
			quizId: quizAttempts.quizId,
			score: quizAttempts.score,
			timeSpent: quizAttempts.timeSpent,
			quizMode: quizAttempts.quizMode,
			completedAt: quizAttempts.completedAt,
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

export async function countCompletedAttempts(db: DbOrTx, userId: string) {
	const [row] = await db
		.select({ value: count() })
		.from(quizAttempts)
		.where(and(eq(quizAttempts.userId, userId), isNotNull(quizAttempts.completedAt)));
	return row?.value ?? 0;
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

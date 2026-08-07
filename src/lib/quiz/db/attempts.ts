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

// Atomic claim: `completed_at IS NULL` is the idempotency key, so only the
// first of several concurrent submissions gets a row back.
export async function claimAttempt(
	db: DbOrTx,
	params: {
		attemptId: string;
		userId: string;
		score: number;
		timeSpent: number;
	}
) {
	const [claimed] = await db
		.update(quizAttempts)
		.set({
			score: params.score,
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
	answers: { questionId: string; userAnswer: string[]; score: number }[]
) {
	if (answers.length === 0) return;
	await db.insert(answerAttempts).values(
		answers.map(answer => ({
			quizAttemptId: attemptId,
			questionId: answer.questionId,
			userAnswer: answer.userAnswer,
			score: answer.score,
		}))
	);
}

export async function findAnswers(db: DbOrTx, attemptId: string) {
	return db
		.select({
			questionId: answerAttempts.questionId,
			userAnswer: answerAttempts.userAnswer,
			score: answerAttempts.score,
		})
		.from(answerAttempts)
		.where(eq(answerAttempts.quizAttemptId, attemptId));
}

// The user dashboard's "recent activity". Lives here because it reads quiz
// tables, even though the user domain is what renders it.
export async function findRecentCompletedAttempts(
	db: DbOrTx,
	userId: string,
	limit: number
) {
	const { primaryCourse, columns } = sectionLocation(db);

	return db
		.select({
			...columns,
			id: quizAttempts.id,
			score: quizAttempts.score,
			completedAt: quizAttempts.completedAt,
		})
		.from(quizAttempts)
		.innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
		.innerJoin(sections, eq(sections.id, quizzes.sectionId))
		.innerJoin(classes, eq(classes.id, sections.classId))
		.leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
		.where(and(eq(quizAttempts.userId, userId), isNotNull(quizAttempts.completedAt)))
		.orderBy(desc(quizAttempts.completedAt))
		.limit(limit);
}

export async function countCompletedAttempts(db: DbOrTx, userId: string) {
	const [row] = await db
		.select({ value: count() })
		.from(quizAttempts)
		.where(and(eq(quizAttempts.userId, userId), isNotNull(quizAttempts.completedAt)));
	return row?.value ?? 0;
}

// Replaces the quiz.quiz_attempts_detail view, and carries the codes the
// results page needs to rebuild the section URL.
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

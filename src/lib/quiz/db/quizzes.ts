import { asc, eq } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { classes, quizQuestions, quizzes, sections } from "@/db/schema";
import { primaryCourseByClass } from "@/lib/catalog/db/course-classes";

import type { QuizMode } from "../types";

export async function insertQuiz(
	db: DbOrTx,
	values: {
		sectionId: string;
		evaluationModeId: string;
		quizMode: QuizMode;
		timeLimit: number | null;
	}
) {
	const [quiz] = await db.insert(quizzes).values(values).returning({
		id: quizzes.id,
	});
	return quiz;
}

export async function insertQuizQuestions(
	db: DbOrTx,
	quizId: string,
	questionIds: string[]
) {
	await db.insert(quizQuestions).values(
		questionIds.map((questionId, index) => ({
			quizId,
			questionId,
			order: index + 1,
		}))
	);
}

export async function findQuizQuestionOrder(db: DbOrTx, quizId: string) {
	return db
		.select({
			questionId: quizQuestions.questionId,
			order: quizQuestions.order,
		})
		.from(quizQuestions)
		.where(eq(quizQuestions.quizId, quizId))
		.orderBy(asc(quizQuestions.order));
}

// Replaces the quiz.quizzes_detail view.
export async function findQuizWithChain(db: DbOrTx, quizId: string) {
	const primaryCourse = primaryCourseByClass(db);

	const [quiz] = await db
		.select({
			id: quizzes.id,
			timeLimit: quizzes.timeLimit,
			quizMode: quizzes.quizMode,
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
		.from(quizzes)
		.innerJoin(sections, eq(sections.id, quizzes.sectionId))
		.innerJoin(classes, eq(classes.id, sections.classId))
		.leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
		.where(eq(quizzes.id, quizId))
		.limit(1);

	return quiz;
}

export async function findQuizSectionAndMode(db: DbOrTx, quizId: string) {
	const [quiz] = await db
		.select({
			sectionId: quizzes.sectionId,
			quizMode: quizzes.quizMode,
			evaluationModeId: quizzes.evaluationModeId,
		})
		.from(quizzes)
		.where(eq(quizzes.id, quizId))
		.limit(1);
	return quiz;
}

export async function deleteQuiz(db: DbOrTx, quizId: string) {
	// quiz_questions cascade on the foreign key.
	await db.delete(quizzes).where(eq(quizzes.id, quizId));
}

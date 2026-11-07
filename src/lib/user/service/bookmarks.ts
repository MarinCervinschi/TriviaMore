import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { bookmarks, classes, questions, sections } from "@/db/schema";
import {
	accessibleSectionsSql,
	assertSectionAccess,
	readsPrivateSections,
} from "@/lib/auth/checks";
import { sectionLocation } from "@/lib/catalog/db/section-location";
import { NotFound } from "@/lib/server/errors";

import type { UserBookmark } from "../types";

export async function getUserBookmarks(userId: string): Promise<UserBookmark[]> {
	const db = getDb();
	const { primaryCourse, columns } = sectionLocation(db);
	const readsPrivate = await readsPrivateSections(db, userId);

	return db
		.select({
			...columns,
			questionId: questions.id,
			createdAt: bookmarks.createdAt,
			content: questions.content,
			questionType: questions.questionType,
			options: questions.options,
			correctAnswer: questions.correctAnswer,
			explanation: questions.explanation,
			difficulty: questions.difficulty,
		})
		.from(bookmarks)
		.innerJoin(questions, eq(questions.id, bookmarks.questionId))
		.innerJoin(sections, eq(sections.id, questions.sectionId))
		.innerJoin(classes, eq(classes.id, sections.classId))
		.leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
		.where(
			and(eq(bookmarks.userId, userId), accessibleSectionsSql(db, userId, readsPrivate))
		)
		.orderBy(desc(bookmarks.createdAt));
}

export async function getBookmarkedQuestionIds(userId: string): Promise<string[]> {
	const rows = await getDb()
		.select({ questionId: bookmarks.questionId })
		.from(bookmarks)
		.where(eq(bookmarks.userId, userId));
	return rows.map(row => row.questionId);
}

export async function toggleBookmark(
	userId: string,
	questionId: string
): Promise<{ action: "added" | "removed" }> {
	const db = getDb();
	const [question] = await db
		.select({ sectionId: questions.sectionId })
		.from(questions)
		.where(eq(questions.id, questionId))
		.limit(1);
	if (!question) throw new NotFound("Domanda non trovata");
	await assertSectionAccess(db, userId, question.sectionId);

	const inserted = await db
		.insert(bookmarks)
		.values({ userId, questionId })
		.onConflictDoNothing()
		.returning({ questionId: bookmarks.questionId });

	if (inserted.length > 0) return { action: "added" };

	await db
		.delete(bookmarks)
		.where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
	return { action: "removed" };
}

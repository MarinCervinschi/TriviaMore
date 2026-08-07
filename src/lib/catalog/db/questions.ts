import { inArray, sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { questions } from "@/db/schema";

// Question types are split by study mode: quizzes are graded automatically, so
// they only take the closed-answer types; flashcards take the open ones.
export const QUIZ_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE"] as const;
export const FLASHCARD_QUESTION_TYPE = "SHORT_ANSWER" as const;

type SectionQuestionCounts = {
	total: number;
	quiz: number;
	flashcard: number;
};

// Grouped so that a listing costs one query instead of three per section.
export async function countQuestionsBySection(
	db: DbOrTx,
	sectionIds: string[]
): Promise<Map<string, SectionQuestionCounts>> {
	const counts = new Map<string, SectionQuestionCounts>();
	if (sectionIds.length === 0) return counts;

	const rows = await db
		.select({
			sectionId: questions.sectionId,
			total: sql<number>`count(*)`.mapWith(Number),
			quiz: sql<number>`count(*) filter (where ${questions.questionType} in ('MULTIPLE_CHOICE', 'TRUE_FALSE'))`.mapWith(
				Number
			),
			flashcard:
				sql<number>`count(*) filter (where ${questions.questionType} = 'SHORT_ANSWER')`.mapWith(
					Number
				),
		})
		.from(questions)
		.where(inArray(questions.sectionId, sectionIds))
		.groupBy(questions.sectionId);

	for (const row of rows) {
		counts.set(row.sectionId, {
			total: row.total,
			quiz: row.quiz,
			flashcard: row.flashcard,
		});
	}
	return counts;
}

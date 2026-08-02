import { asc, eq } from "drizzle-orm"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courses,
  departments,
  questions,
  sections,
} from "@/db/schema"
import { requireAdmin } from "@/lib/auth/guards"
import { NotFound } from "@/lib/server/errors"

import {
  assertSectionScope,
  requireContentManagerForQuestion,
  requireContentManagerForSection,
  requireQuestionAccess,
} from "../server/access"
import type { QuestionInput, UpdateQuestionInput } from "../schemas"
import type { AdminQuestionDetail } from "../types"

function toRow(input: QuestionInput) {
  return {
    content: input.content,
    questionType: input.question_type,
    options: input.options ?? null,
    correctAnswer: input.correct_answer,
    explanation: input.explanation || null,
    difficulty: input.difficulty,
    sectionId: input.section_id,
  }
}

export async function getAdminQuestionDetail(
  id: string,
): Promise<AdminQuestionDetail> {
  await requireQuestionAccess(id)
  const db = getDb()

  const [question] = await db
    .select({
      id: questions.id,
      content: questions.content,
      questionType: questions.questionType,
      options: questions.options,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
      sectionId: questions.sectionId,
      createdAt: questions.createdAt,
      updatedAt: questions.updatedAt,
      sectionName: sections.name,
      classId: classes.id,
      className: classes.name,
    })
    .from(questions)
    .innerJoin(sections, eq(sections.id, questions.sectionId))
    .innerJoin(classes, eq(classes.id, sections.classId))
    .where(eq(questions.id, id))
    .limit(1)
  if (!question) throw new NotFound("Domanda non trovata")

  const [parent] = await db
    .select({
      classCode: courseClasses.code,
      courseName: courses.name,
      courseCode: courses.code,
      departmentName: departments.name,
      departmentCode: departments.code,
    })
    .from(courseClasses)
    .innerJoin(courses, eq(courses.id, courseClasses.courseId))
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .where(eq(courseClasses.classId, question.classId))
    .orderBy(asc(courseClasses.position))
    .limit(1)

  return { ...question, parent: parent ?? null }
}

export async function createQuestion(input: QuestionInput) {
  await requireContentManagerForSection(input.section_id)

  const [question] = await getDb()
    .insert(questions)
    .values(toRow(input))
    .returning()
  return question
}

export async function createQuestionsBulk(input: QuestionInput[]) {
  const user = await requireAdmin()

  // Every distinct target section is scope-checked before anything is written.
  for (const sectionId of new Set(input.map((q) => q.section_id))) {
    await assertSectionScope(user, sectionId)
  }

  if (input.length === 0) return []
  return getDb().insert(questions).values(input.map(toRow)).returning()
}

export async function updateQuestion(
  id: string,
  updates: UpdateQuestionInput,
) {
  await requireContentManagerForQuestion(id)

  const [question] = await getDb()
    .update(questions)
    .set({
      content: updates.content,
      questionType: updates.question_type,
      options: updates.options === undefined ? undefined : updates.options ?? null,
      correctAnswer: updates.correct_answer,
      explanation:
        updates.explanation === undefined
          ? undefined
          : updates.explanation || null,
      difficulty: updates.difficulty,
    })
    .where(eq(questions.id, id))
    .returning()

  if (!question) throw new NotFound("Domanda non trovata")
  return question
}

export async function deleteQuestion(id: string) {
  await requireContentManagerForQuestion(id)
  await getDb().delete(questions).where(eq(questions.id, id))
}

import { desc, eq } from "drizzle-orm"

import { getDb } from "@/db"
import { classes, progress, sections } from "@/db/schema"

import { sectionLocation } from "@/lib/catalog/db/section-location"

import type { UserProgress } from "../types"

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const db = getDb()
  const { primaryCourse, columns } = sectionLocation(db)

  return db
    .select({
      ...columns,
      id: progress.id,
      quizMode: progress.quizMode,
      quizzesTaken: progress.quizzesTaken,
      averageScore: progress.averageScore,
      bestScore: progress.bestScore,
      totalTimeSpent: progress.totalTimeSpent,
      lastAccessedAt: progress.lastAccessedAt,
    })
    .from(progress)
    .innerJoin(sections, eq(sections.id, progress.sectionId))
    .innerJoin(classes, eq(classes.id, sections.classId))
    .leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
    .where(eq(progress.userId, userId))
    .orderBy(desc(progress.lastAccessedAt))
}

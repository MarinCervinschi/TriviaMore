import type { profiles, progress, questions } from "@/db/schema"

type Profile = typeof profiles.$inferSelect
type QuestionRow = typeof questions.$inferSelect

export type UserProfile = Profile & {
  stats: UserStats
  recentClasses: RecentClass[]
  recentQuizAttempts: RecentQuizAttempt[]
}

export type UserStats = {
  quizAttemptsCount: number
  userClassesCount: number
  bookmarksCount: number
  totalQuizzes: number
  averageScore: number
}

// A class as it appears in a user's own lists: the class itself, the junction
// fields for the course they saved it under, and that course's department.
type EnrolledClass = {
  classId: string
  className: string
  classCode: string | null
  classYear: number | null
  mandatory: boolean | null
  catalogueUrl: string | null
  curriculum: string | null
  courseId: string
  courseName: string
  courseCode: string
  courseType: string
  departmentId: string
  departmentName: string
  departmentCode: string
}

export type UserClass = EnrolledClass & {
  createdAt: string
}

export type RecentClass = EnrolledClass & {
  lastVisited: string
  visitCount: number
}

// Where a section sits in the catalog, resolved through the primary course of
// its class.
type SectionLocation = {
  sectionId: string
  sectionName: string
  classId: string
  className: string
  courseId: string | null
  courseName: string | null
  departmentId: string | null
  departmentName: string | null
}

export type UserBookmark = SectionLocation &
  Pick<
    QuestionRow,
    | "content"
    | "questionType"
    | "options"
    | "correctAnswer"
    | "explanation"
    | "difficulty"
  > & {
    questionId: string
    createdAt: string
  }

export type RecentQuizAttempt = SectionLocation & {
  id: string
  score: number
  completedAt: string
}

export type UserProgress = SectionLocation &
  Pick<
    typeof progress.$inferSelect,
    | "id"
    | "quizMode"
    | "quizzesTaken"
    | "averageScore"
    | "bestScore"
    | "totalTimeSpent"
    | "lastAccessedAt"
  >

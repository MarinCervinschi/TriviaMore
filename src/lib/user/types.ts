import type { Json, Tables } from "@/lib/supabase/database.types"

// Base table types
type Profile = Tables<"profiles">

// User profile with aggregated stats
export type UserProfile = Profile & {
  stats: UserStats
  recent_classes: RecentClass[]
  recent_quiz_attempts: RecentQuizAttempt[]
}

export type UserStats = {
  quiz_attempts_count: number
  user_classes_count: number
  bookmarks_count: number
  total_quizzes: number
  average_score: number
}

// User saved classes (from user_classes_detail view)
export type UserClass = {
  created_at: string
  class_id: string
  class_name: string
  class_code: string
  class_year: number
  course_id: string
  course_name: string
  course_code: string
  course_type: string
  department_id: string
  department_name: string
  department_code: string
}

// User bookmarks (from bookmarks_detail view)
export type UserBookmark = {
  question_id: string
  created_at: string
  content: string
  question_type: string
  options: Json | null
  correct_answer: string[]
  explanation: string | null
  difficulty: string
  section_id: string
  section_name: string
  class_id: string
  class_name: string
  course_id: string
  course_name: string
  department_id: string
  department_name: string
}

// Recently visited class (from user_recent_classes_detail view)
export type RecentClass = {
  last_visited: string
  visit_count: number
  class_id: string
  class_name: string
  class_code: string
  class_year: number
  course_id: string
  course_name: string
  course_code: string
  course_type: string
  department_id: string
  department_name: string
  department_code: string
}

// Recent quiz attempt for dashboard (from quiz_attempts_detail view)
export type RecentQuizAttempt = {
  id: string
  score: number
  completed_at: string
  section_id: string
  section_name: string
  class_id: string
  class_name: string
  course_id: string
  course_name: string
  department_id: string
  department_name: string
}

// Progress record (from progress_detail view)
export type UserProgress = {
  id: string
  quiz_mode: "STUDY" | "EXAM_SIMULATION"
  quizzes_taken: number
  average_score: number | null
  best_score: number | null
  total_time_spent: number
  last_accessed_at: string
  section_id: string
  section_name: string
  class_id: string
  class_name: string
  course_id: string
  course_name: string
  department_id: string
  department_name: string
}

// Helper type for JSON options
export type QuestionOptions = Json

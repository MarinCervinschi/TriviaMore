import type { Json, Tables } from "@/lib/supabase/database.types"

// Base table types
type Profile = Tables<"profiles">
type Class = Tables<"classes">
type Course = Tables<"courses">
type Department = Tables<"departments">
type Section = Tables<"sections">
type Question = Tables<"questions">

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

// User saved classes
export type UserClass = {
  class_id: string
  created_at: string
  updated_at: string
  class: Class & {
    course: Course & {
      department: Department
    }
  }
}

// User bookmarks with full question chain
export type UserBookmark = {
  question_id: string
  created_at: string
  question: Question & {
    section: Section & {
      class: Class & {
        course: Course & {
          department: Department
        }
      }
    }
  }
}

// Recently visited class
export type RecentClass = {
  last_visited: string
  visit_count: number
  class: Class & {
    course: Course & {
      department: Department
    }
  }
}

// Recent quiz attempt for dashboard
export type RecentQuizAttempt = {
  id: string
  score: number
  completed_at: string
  quiz: {
    section: Section & {
      class: Class & {
        course: Course & {
          department: Department
        }
      }
    }
  }
}

// Progress record
export type UserProgress = {
  id: string
  quiz_mode: "STUDY" | "EXAM_SIMULATION"
  quizzes_taken: number
  average_score: number | null
  best_score: number | null
  total_time_spent: number
  last_accessed_at: string
  section: Section & {
    class: Class & {
      course: Course & {
        department: Department
      }
    }
  }
}

// Helper type for JSON options
export type QuestionOptions = Json

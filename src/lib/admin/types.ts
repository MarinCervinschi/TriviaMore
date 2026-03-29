import type { CatalogTables, Database } from "@/lib/supabase/database.types"

// Row types (catalog schema)
export type Department = CatalogTables<"departments">
export type Course = CatalogTables<"courses">
export type Class = CatalogTables<"classes">
export type Section = CatalogTables<"sections">
export type Question = CatalogTables<"questions">

// Admin list types (with child counts)
export type AdminDepartment = Department & { courses: { count: number }[] }
export type AdminCourse = Course & {
  classes: { count: number }[]
  department: Department
}
export type AdminClass = Class & {
  sections: { count: number }[]
  course: Course & { department: Department }
}
export type AdminSection = Section & {
  questions: { count: number }[]
  class: Class & { course: Course & { department: Department } }
}

// Content tree for sidebar navigation
export type ContentTreeDepartment = {
  id: string
  name: string
  code: string
  courses: ContentTreeCourse[]
}

export type ContentTreeCourse = {
  id: string
  name: string
  code: string
  classes: ContentTreeClass[]
}

export type ContentTreeClass = {
  id: string
  name: string
  code: string
  sections: ContentTreeSection[]
}

export type ContentTreeSection = {
  id: string
  name: string
}

// Admin dashboard stats
export type AdminStats = {
  departmentCount: number
  courseCount: number
  classCount: number
  sectionCount: number
  questionCount: number
}

// Admin permissions
export type AdminPermissions = {
  role: Database["public"]["Enums"]["role"]
  managedDepartmentIds: string[]
  maintainedCourseIds: string[]
}

// ─── User Management ───

export type UserRole = Database["public"]["Enums"]["role"]

export type AdminUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: UserRole
  created_at: string
  quiz_attempts_count: number
}

export type AdminUserDetail = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: UserRole
  created_at: string
  managed_departments: { id: string; name: string; code: string }[]
  maintained_courses: {
    id: string
    name: string
    code: string
    department_name: string
  }[]
  section_accesses: {
    id: string
    name: string
    class_name: string
  }[]
  stats: {
    total_quizzes: number
    average_score: number | null
    last_quiz_at: string | null
  }
}

export type AdminUserStats = {
  totalUsers: number
  byRole: Record<string, number>
  totalQuizAttempts: number
  recentQuizAttempts: number
  averageScore: number | null
  activeUsers: number
}

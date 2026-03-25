import type { Tables } from "@/lib/supabase/database.types"

// Base table types from Supabase
type Department = Tables<"departments">
type Course = Tables<"courses">
type Class = Tables<"classes">
type Section = Tables<"sections">

// Browse listing types (with relation counts)

export type BrowseDepartment = Department & {
  courses: { count: number }[]
}

export type BrowseCourse = Course & {
  classes: { count: number }[]
}

export type BrowseClass = Class & {
  sections: { count: number }[]
}

export type BrowseSection = Section & {
  question_count: number
  quiz_question_count: number
  flashcard_question_count: number
}

// Detail types (with parent chain)

export type DepartmentWithCourses = Department & {
  courses: BrowseCourse[]
}

export type CourseWithClasses = Course & {
  department: Department
  classes: BrowseClass[]
}

export type ClassWithSections = Class & {
  course: Course & {
    department: Department
  }
  sections: BrowseSection[]
}

export type SectionDetail = Section & {
  class: Class & {
    course: Course & {
      department: Department
    }
  }
  question_count: number
  quiz_question_count: number
  flashcard_question_count: number
}

import type { CatalogTables } from "@/lib/supabase/database.types"

// Base table types from Supabase (catalog schema)
type Department = CatalogTables<"departments">
type Course = CatalogTables<"courses">
type Class = CatalogTables<"classes">
type Section = CatalogTables<"sections">
type CourseClass = CatalogTables<"course_classes">

// Junction fields that come from course_classes
export type CourseClassInfo = Pick<
  CourseClass,
  "code" | "class_year" | "mandatory" | "catalogue_url" | "curriculum" | "position"
>

// Browse listing types (with relation counts)

export type BrowseDepartment = Department & {
  courses: { count: number }[]
}

export type BrowseCourse = Course & {
  course_classes: { count: number }[]
}

// Class as seen under a specific course (junction fields merged)
export type BrowseClassInCourse = CourseClassInfo & {
  class: Class & {
    sections: { count: number }[]
  }
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
  classes: BrowseClassInCourse[]
}

export type ClassWithSections = Class & {
  courseClass: CourseClassInfo
  course: Course & {
    department: Department
  }
  sections: BrowseSection[]
  examSimulation?: {
    sectionId: string
    totalQuizQuestions: number
    totalFlashcardQuestions: number
  }
}

export type SectionDetail = Section & {
  class: Class & {
    courseClass: CourseClassInfo
    course: Course & {
      department: Department
    }
  }
  question_count: number
  quiz_question_count: number
  flashcard_question_count: number
}

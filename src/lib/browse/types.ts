import type { CatalogTables } from "@/lib/supabase/database.types"

// Base table types from Supabase (catalog schema)
type Department = CatalogTables<"departments">
type Course = CatalogTables<"courses">
type Class = CatalogTables<"classes">
type Section = CatalogTables<"sections">
type CourseClass = CatalogTables<"course_classes">
type DepartmentLocationRow = CatalogTables<"department_locations">

export type DepartmentLocation = Pick<
  DepartmentLocationRow,
  "id" | "name" | "address" | "latitude" | "longitude" | "campus_location" | "is_primary" | "position"
>

// Junction fields that come from course_classes
export type CourseClassInfo = Pick<
  CourseClass,
  "code" | "class_year" | "mandatory" | "catalogue_url" | "curriculum" | "position"
>

// Browse listing types (with relation counts)

export type BrowseDepartment = Department & {
  courses: { count: number }[]
  department_locations: Pick<DepartmentLocation, "campus_location">[]
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
  department_locations: DepartmentLocation[]
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

// Overview types (for /browse showcase page)

export type OverviewLocation = DepartmentLocation & {
  department: Pick<Department, "code" | "name">
}

export interface BrowseOverview {
  stats: {
    departments: number
    courses: number
    classes: number
    sections: number
    questions: number
  }
  coursesByDepartment: { name: string; code: string; count: number }[]
  coursesByType: { type: string; label: string; count: number }[]
  coursesByCampus: { campus: string; label: string; count: number }[]
  locations: OverviewLocation[]
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

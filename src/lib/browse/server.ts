import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { contactSchema } from "./contact-schema"
import type {
  BrowseDepartment,
  BrowseSection,
  ClassWithSections,
  CourseWithClasses,
  DepartmentWithCourses,
  SectionDetail,
} from "./types"

export const getDepartmentsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<BrowseDepartment[]> => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("departments")
      .select("*, courses(count)")
      .order("position")

    if (error) throw new Error(error.message)
    return data as BrowseDepartment[]
  },
)

export const getDepartmentWithCoursesFn = createServerFn({ method: "GET" })
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data }): Promise<DepartmentWithCourses | null> => {
    const supabase = createServerSupabaseClient()

    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("*")
      .ilike("code", data.code)
      .single()

    if (deptError || !department) return null

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*, classes(count)")
      .eq("department_id", department.id)
      .order("position")

    if (coursesError) throw new Error(coursesError.message)

    return { ...department, courses: courses as DepartmentWithCourses["courses"] }
  })

export const getCourseWithClassesFn = createServerFn({ method: "GET" })
  .inputValidator((input: { deptCode: string; courseCode: string }) => input)
  .handler(async ({ data }): Promise<CourseWithClasses | null> => {
    const supabase = createServerSupabaseClient()

    // Find department first
    const { data: department } = await supabase
      .from("departments")
      .select("*")
      .ilike("code", data.deptCode)
      .single()

    if (!department) return null

    // Find course in that department
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("department_id", department.id)
      .ilike("code", data.courseCode)
      .single()

    if (!course) return null

    // Get classes with section counts
    const { data: classes, error } = await supabase
      .from("classes")
      .select("*, sections(count)")
      .eq("course_id", course.id)
      .order("class_year")
      .order("position")

    if (error) throw new Error(error.message)

    return {
      ...course,
      department,
      classes: classes as CourseWithClasses["classes"],
    }
  })

export const getClassWithSectionsFn = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { deptCode: string; courseCode: string; classCode: string }) => input,
  )
  .handler(async ({ data }): Promise<ClassWithSections | null> => {
    const supabase = createServerSupabaseClient()

    // Find department
    const { data: department } = await supabase
      .from("departments")
      .select("*")
      .ilike("code", data.deptCode)
      .single()

    if (!department) return null

    // Find course
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("department_id", department.id)
      .ilike("code", data.courseCode)
      .single()

    if (!course) return null

    // Find class
    const { data: classData } = await supabase
      .from("classes")
      .select("*")
      .eq("course_id", course.id)
      .ilike("code", data.classCode)
      .single()

    if (!classData) return null

    // Get sections with question type breakdown
    const { data: sections } = await supabase
      .from("sections")
      .select("*")
      .eq("class_id", classData.id)
      .neq("name", "Exam Simulation")
      .order("position")

    if (!sections) return null

    // Get question counts per section
    const sectionsWithCounts: BrowseSection[] = await Promise.all(
      sections.map(async (section) => {
        const { count: totalCount } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("section_id", section.id)

        const { count: quizCount } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("section_id", section.id)
          .in("question_type", ["MULTIPLE_CHOICE", "TRUE_FALSE"])

        const { count: flashcardCount } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("section_id", section.id)
          .eq("question_type", "SHORT_ANSWER")

        return {
          ...section,
          question_count: totalCount ?? 0,
          quiz_question_count: quizCount ?? 0,
          flashcard_question_count: flashcardCount ?? 0,
        }
      }),
    )

    return {
      ...classData,
      course: { ...course, department },
      sections: sectionsWithCounts,
    }
  })

export const getSectionDetailFn = createServerFn({ method: "GET" })
  .inputValidator(
    (input: {
      deptCode: string
      courseCode: string
      classCode: string
      sectionSlug: string
    }) => input,
  )
  .handler(async ({ data }): Promise<SectionDetail | null> => {
    const supabase = createServerSupabaseClient()

    // Build parent chain
    const { data: department } = await supabase
      .from("departments")
      .select("*")
      .ilike("code", data.deptCode)
      .single()

    if (!department) return null

    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("department_id", department.id)
      .ilike("code", data.courseCode)
      .single()

    if (!course) return null

    const { data: classData } = await supabase
      .from("classes")
      .select("*")
      .eq("course_id", course.id)
      .ilike("code", data.classCode)
      .single()

    if (!classData) return null

    // Find section by slug (hyphens → spaces)
    const sectionName = data.sectionSlug.replace(/-/g, " ")
    const { data: section } = await supabase
      .from("sections")
      .select("*")
      .eq("class_id", classData.id)
      .ilike("name", sectionName)
      .single()

    if (!section) return null

    // Get question counts
    const { count: totalCount } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section.id)

    const { count: quizCount } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section.id)
      .in("question_type", ["MULTIPLE_CHOICE", "TRUE_FALSE"])

    const { count: flashcardCount } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section.id)
      .eq("question_type", "SHORT_ANSWER")

    return {
      ...section,
      class: { ...classData, course: { ...course, department } },
      question_count: totalCount ?? 0,
      quiz_question_count: quizCount ?? 0,
      flashcard_question_count: flashcardCount ?? 0,
    }
  })

export const submitContactFn = createServerFn({ method: "POST" })
  .inputValidator(contactSchema)
  .handler(async ({ data }) => {
    // For now, log the contact submission
    // TODO: integrate Resend email or store in Supabase table
    console.log("Contact form submission:", data)
    return { success: true }
  })

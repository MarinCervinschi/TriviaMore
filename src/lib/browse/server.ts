import { createServerFn } from "@tanstack/react-start"

import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"
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

    const { data, error } = await catalogQuery(supabase)
      .from("departments")
      .select("*, courses(count), department_locations(campus_location)")
      .order("position")

    if (error) throw new Error(error.message)
    return data as BrowseDepartment[]
  },
)

export const getDepartmentWithCoursesFn = createServerFn({ method: "GET" })
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data }): Promise<DepartmentWithCourses | null> => {
    const supabase = createServerSupabaseClient()

    const { data: department, error: deptError } = await catalogQuery(supabase)
      .from("departments")
      .select("*")
      .ilike("code", data.code)
      .single()

    if (deptError || !department) return null

    const [coursesResult, locationsResult] = await Promise.all([
      catalogQuery(supabase)
        .from("courses")
        .select("*, course_classes(count)")
        .eq("department_id", department.id)
        .order("position"),
      catalogQuery(supabase)
        .from("department_locations")
        .select("id, name, address, latitude, longitude, campus_location, is_primary, position")
        .eq("department_id", department.id)
        .order("position"),
    ])

    if (coursesResult.error) throw new Error(coursesResult.error.message)
    if (locationsResult.error) throw new Error(locationsResult.error.message)

    return {
      ...department,
      courses: coursesResult.data as DepartmentWithCourses["courses"],
      department_locations: locationsResult.data as DepartmentWithCourses["department_locations"],
    }
  })

export const getCourseWithClassesFn = createServerFn({ method: "GET" })
  .inputValidator((input: { deptCode: string; courseCode: string }) => input)
  .handler(async ({ data }): Promise<CourseWithClasses | null> => {
    const supabase = createServerSupabaseClient()

    // Find department first
    const { data: department } = await catalogQuery(supabase)
      .from("departments")
      .select("*")
      .ilike("code", data.deptCode)
      .single()

    if (!department) return null

    // Find course in that department
    const { data: course } = await catalogQuery(supabase)
      .from("courses")
      .select("*")
      .eq("department_id", department.id)
      .ilike("code", data.courseCode)
      .single()

    if (!course) return null

    // Get classes via junction with section counts
    const { data: courseClasses, error } = await catalogQuery(supabase)
      .from("course_classes")
      .select("code, class_year, mandatory, catalogue_url, curriculum, position, class:classes(*, sections(count))")
      .eq("course_id", course.id)
      .order("class_year")
      .order("position")

    if (error) throw new Error(error.message)

    return {
      ...course,
      department,
      classes: (courseClasses ?? []) as CourseWithClasses["classes"],
    }
  })

export const getClassWithSectionsFn = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { deptCode: string; courseCode: string; classCode: string }) => input,
  )
  .handler(async ({ data }): Promise<ClassWithSections | null> => {
    const supabase = createServerSupabaseClient()

    // Find department
    const { data: department } = await catalogQuery(supabase)
      .from("departments")
      .select("*")
      .ilike("code", data.deptCode)
      .single()

    if (!department) return null

    // Find course
    const { data: course } = await catalogQuery(supabase)
      .from("courses")
      .select("*")
      .eq("department_id", department.id)
      .ilike("code", data.courseCode)
      .single()

    if (!course) return null

    // Find class via junction (classCode matches course_classes.code)
    const { data: courseClass } = await catalogQuery(supabase)
      .from("course_classes")
      .select("*, class:classes(*)")
      .eq("course_id", course.id)
      .ilike("code", data.classCode)
      .single()

    if (!courseClass || !courseClass.class) return null

    const classData = courseClass.class as any

    // Get sections with question type breakdown
    const { data: sections } = await catalogQuery(supabase)
      .from("sections")
      .select("*")
      .eq("class_id", classData.id)
      .neq("name", "Exam Simulation")
      .order("position")

    if (!sections) return null

    // Get question counts per section
    const sectionsWithCounts: BrowseSection[] = await Promise.all(
      sections.map(async (section) => {
        const { count: totalCount } = await catalogQuery(supabase)
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("section_id", section.id)

        const { count: quizCount } = await catalogQuery(supabase)
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("section_id", section.id)
          .in("question_type", ["MULTIPLE_CHOICE", "TRUE_FALSE"])

        const { count: flashcardCount } = await catalogQuery(supabase)
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

    // Exam simulation: find or create sentinel section
    const totalQuizQuestions = sectionsWithCounts.reduce(
      (sum, s) => sum + s.quiz_question_count, 0,
    )
    const totalFlashcardQuestions = sectionsWithCounts.reduce(
      (sum, s) => sum + s.flashcard_question_count, 0,
    )

    let examSimulation: ClassWithSections["examSimulation"] = undefined

    if (totalQuizQuestions > 0 || totalFlashcardQuestions > 0) {
      let { data: examSection } = await catalogQuery(supabase)
        .from("sections")
        .select("id")
        .eq("class_id", classData.id)
        .eq("name", "Exam Simulation")
        .maybeSingle()

      if (!examSection) {
        const { data: newSection } = await catalogQuery(supabase)
          .from("sections")
          .insert({
            id: crypto.randomUUID(),
            class_id: classData.id,
            name: "Exam Simulation",
            is_public: true,
            position: 9999,
          })
          .select("id")
          .single()
        examSection = newSection
      }

      if (examSection) {
        examSimulation = {
          sectionId: examSection.id,
          totalQuizQuestions,
          totalFlashcardQuestions,
        }
      }
    }

    return {
      ...classData,
      courseClass: {
        code: courseClass.code,
        class_year: courseClass.class_year,
        mandatory: courseClass.mandatory,
        catalogue_url: courseClass.catalogue_url,
        curriculum: courseClass.curriculum,
        position: courseClass.position,
      },
      course: { ...course, department },
      sections: sectionsWithCounts,
      examSimulation,
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
    const { data: department } = await catalogQuery(supabase)
      .from("departments")
      .select("*")
      .ilike("code", data.deptCode)
      .single()

    if (!department) return null

    const { data: course } = await catalogQuery(supabase)
      .from("courses")
      .select("*")
      .eq("department_id", department.id)
      .ilike("code", data.courseCode)
      .single()

    if (!course) return null

    // Find class via junction
    const { data: courseClassRow } = await catalogQuery(supabase)
      .from("course_classes")
      .select("*, class:classes(*)")
      .eq("course_id", course.id)
      .ilike("code", data.classCode)
      .single()

    if (!courseClassRow || !courseClassRow.class) return null

    const classData = courseClassRow.class as any

    // Find section by slug (hyphens → spaces)
    const sectionName = data.sectionSlug.replace(/-/g, " ")
    const { data: section } = await catalogQuery(supabase)
      .from("sections")
      .select("*")
      .eq("class_id", classData.id)
      .ilike("name", sectionName)
      .single()

    if (!section) return null

    // Get question counts
    const { count: totalCount } = await catalogQuery(supabase)
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section.id)

    const { count: quizCount } = await catalogQuery(supabase)
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section.id)
      .in("question_type", ["MULTIPLE_CHOICE", "TRUE_FALSE"])

    const { count: flashcardCount } = await catalogQuery(supabase)
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section.id)
      .eq("question_type", "SHORT_ANSWER")

    return {
      ...section,
      class: {
        ...classData,
        courseClass: {
          code: courseClassRow.code,
          class_year: courseClassRow.class_year,
          mandatory: courseClassRow.mandatory,
          catalogue_url: courseClassRow.catalogue_url,
          curriculum: courseClassRow.curriculum,
          position: courseClassRow.position,
        },
        course: { ...course, department },
      },
      question_count: totalCount ?? 0,
      quiz_question_count: quizCount ?? 0,
      flashcard_question_count: flashcardCount ?? 0,
    }
  })

export interface PlatformStats {
  departments: number
  courses: number
  classes: number
  sections: number
}

export const getPlatformStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PlatformStats> => {
    const supabase = createServerSupabaseClient()

    const [depts, courses, classes, sections] = await Promise.all([
      catalogQuery(supabase).from("departments").select("*", { count: "exact", head: true }),
      catalogQuery(supabase).from("courses").select("*", { count: "exact", head: true }),
      catalogQuery(supabase).from("classes").select("*", { count: "exact", head: true }),
      catalogQuery(supabase).from("sections").select("*", { count: "exact", head: true }),
    ])

    return {
      departments: depts.count ?? 0,
      courses: courses.count ?? 0,
      classes: classes.count ?? 0,
      sections: sections.count ?? 0,
    }
  },
)

export const submitContactFn = createServerFn({ method: "POST" })
  .inputValidator(contactSchema)
  .handler(async () => {
    // TODO: integrate Resend email or store in Supabase table
    return { success: true }
  })

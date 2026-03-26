import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import type {
  AdminCourse,
  AdminDepartment,
  AdminPermissions,
  AdminStats,
  AdminUser,
  AdminUserDetail,
  AdminUserStats,
  UserRole,
} from "./types"

const ID_LETTERS = "abcdefghijklmnopqrstuvwxyz"

/** Convert plain string options to {id, text} format for DB storage */
function toDbOptions(
  options: string[] | null | undefined,
): Array<{ id: string; text: string }> | null {
  if (!options) return null
  return options.map((text, i) => ({ id: ID_LETTERS[i], text }))
}

// ─── Dashboard ───

export const getAdminStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminStats> => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const [departments, courses, classes, sections, questions] =
      await Promise.all([
        supabase
          .from("departments")
          .select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("classes").select("*", { count: "exact", head: true }),
        supabase.from("sections").select("*", { count: "exact", head: true }),
        supabase.from("questions").select("*", { count: "exact", head: true }),
      ])

    return {
      departmentCount: departments.count ?? 0,
      courseCount: courses.count ?? 0,
      classCount: classes.count ?? 0,
      sectionCount: sections.count ?? 0,
      questionCount: questions.count ?? 0,
    }
  },
)

export const getAdminPermissionsFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<AdminPermissions> => {
  const user = await requireAdmin()
  const supabase = createServerSupabaseClient()

  const [deptAdmins, courseMaintainers] = await Promise.all([
    supabase
      .from("department_admins")
      .select("department_id")
      .eq("user_id", user.id),
    supabase
      .from("course_maintainers")
      .select("course_id")
      .eq("user_id", user.id),
  ])

  return {
    role: user.role,
    managedDepartmentIds: (deptAdmins.data ?? []).map(
      (d) => d.department_id,
    ),
    maintainedCourseIds: (courseMaintainers.data ?? []).map(
      (c) => c.course_id,
    ),
  }
})

// ─── Departments ───

export const getAdminDepartmentsFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<AdminDepartment[]> => {
  await requireAdmin()
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("departments")
    .select("*, courses(count)")
    .order("position")

  if (error) throw new Error(error.message)
  return data as AdminDepartment[]
})

export const getAdminDepartmentDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .single()

    if (deptError) throw new Error(deptError.message)

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*, classes(count)")
      .eq("department_id", id)
      .order("position")

    if (coursesError) throw new Error(coursesError.message)

    return {
      ...department,
      courses: courses as (AdminCourse["department"] extends unknown
        ? typeof courses
        : never),
    }
  })

export const createDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { name: string; code: string; description?: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    // Get next position
    const { count } = await supabase
      .from("departments")
      .select("*", { count: "exact", head: true })

    const { data: department, error } = await supabase
      .from("departments")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        description: data.description || null,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un dipartimento con questo codice")
      }
      throw new Error(error.message)
    }

    return department
  })

export const updateDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      name?: string
      code?: string
      description?: string
      position?: number
    }) => input,
  )
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: department, error } = await supabase
      .from("departments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un dipartimento con questo codice")
      }
      throw new Error(error.message)
    }

    return department
  })

export const deleteDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    // Check for child courses
    const { count } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("department_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: il dipartimento contiene dei corsi. Elimina prima i corsi.",
      )
    }

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)
  })

// ─── Courses ───

export const getAdminCourseDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*, department:departments(*)")
      .eq("id", id)
      .single()

    if (courseError) throw new Error(courseError.message)

    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("*, sections(count)")
      .eq("course_id", id)
      .order("position")

    if (classesError) throw new Error(classesError.message)

    return { ...course, classes }
  })

export const createCourseFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      name: string
      code: string
      description?: string
      department_id: string
      course_type: "BACHELOR" | "MASTER"
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("department_id", data.department_id)

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        description: data.description || null,
        department_id: data.department_id,
        course_type: data.course_type,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un corso con questo codice")
      }
      throw new Error(error.message)
    }

    return course
  })

export const updateCourseFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      name?: string
      code?: string
      description?: string
      course_type?: "BACHELOR" | "MASTER"
      position?: number
    }) => input,
  )
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.course_type !== undefined)
      updateData.course_type = updates.course_type
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: course, error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un corso con questo codice")
      }
      throw new Error(error.message)
    }

    return course
  })

export const deleteCourseFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: il corso contiene delle classi. Elimina prima le classi.",
      )
    }

    const { error } = await supabase.from("courses").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })

// ─── Classes ───

export const getAdminClassDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: cls, error: clsError } = await supabase
      .from("classes")
      .select("*, course:courses(*, department:departments(*))")
      .eq("id", id)
      .single()

    if (clsError) throw new Error(clsError.message)

    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select("*, questions(count)")
      .eq("class_id", id)
      .order("position")

    if (sectionsError) throw new Error(sectionsError.message)

    return { ...cls, sections }
  })

export const createClassFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      name: string
      code: string
      description?: string
      course_id: string
      class_year: number
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("course_id", data.course_id)

    const { data: cls, error } = await supabase
      .from("classes")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        description: data.description || null,
        course_id: data.course_id,
        class_year: data.class_year,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già una classe con questo codice")
      }
      throw new Error(error.message)
    }

    return cls
  })

export const updateClassFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      name?: string
      code?: string
      description?: string
      class_year?: number
      position?: number
    }) => input,
  )
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.class_year !== undefined)
      updateData.class_year = updates.class_year
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: cls, error } = await supabase
      .from("classes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già una classe con questo codice")
      }
      throw new Error(error.message)
    }

    return cls
  })

export const deleteClassFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("sections")
      .select("*", { count: "exact", head: true })
      .eq("class_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: la classe contiene delle sezioni. Elimina prima le sezioni.",
      )
    }

    const { error } = await supabase.from("classes").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })

// ─── Sections ───

export const getAdminSectionDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: section, error: secError } = await supabase
      .from("sections")
      .select("*, class:classes(*, course:courses(*, department:departments(*)))")
      .eq("id", id)
      .single()

    if (secError) throw new Error(secError.message)

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("section_id", id)
      .order("created_at", { ascending: false })

    if (questionsError) throw new Error(questionsError.message)

    return { ...section, questions }
  })

export const createSectionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      name: string
      description?: string
      class_id: string
      is_public?: boolean
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("sections")
      .select("*", { count: "exact", head: true })
      .eq("class_id", data.class_id)

    const { data: section, error } = await supabase
      .from("sections")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        class_id: data.class_id,
        is_public: data.is_public ?? true,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return section
  })

export const updateSectionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      name?: string
      description?: string
      is_public?: boolean
      position?: number
    }) => input,
  )
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.is_public !== undefined)
      updateData.is_public = updates.is_public
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: section, error } = await supabase
      .from("sections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return section
  })

export const deleteSectionFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: la sezione contiene delle domande. Elimina prima le domande.",
      )
    }

    const { error } = await supabase.from("sections").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })

// ─── Questions ───

export const getAdminQuestionDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: question, error } = await supabase
      .from("questions")
      .select(
        "*, section:sections(*, class:classes(*, course:courses(*, department:departments(*))))",
      )
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const createQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      content: string
      question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
      options?: string[] | null
      correct_answer: string[]
      explanation?: string
      difficulty: "EASY" | "MEDIUM" | "HARD"
      section_id: string
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: question, error } = await supabase
      .from("questions")
      .insert({
        id: crypto.randomUUID(),
        content: data.content,
        question_type: data.question_type,
        options: toDbOptions(data.options),
        correct_answer: data.correct_answer,
        explanation: data.explanation || null,
        difficulty: data.difficulty,
        section_id: data.section_id,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const createQuestionsBulkFn = createServerFn({ method: "POST" })
  .inputValidator(
    (
      input: Array<{
        content: string
        question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
        options?: string[] | null
        correct_answer: string[]
        explanation?: string
        difficulty: "EASY" | "MEDIUM" | "HARD"
        section_id: string
      }>,
    ) => input,
  )
  .handler(async ({ data: questions }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const rows = questions.map((q) => ({
      id: crypto.randomUUID(),
      content: q.content,
      question_type: q.question_type,
      options: toDbOptions(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      difficulty: q.difficulty,
      section_id: q.section_id,
    }))

    const { data, error } = await supabase
      .from("questions")
      .insert(rows)
      .select()

    if (error) throw new Error(error.message)
    return data
  })

export const updateQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      content?: string
      question_type?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
      options?: string[] | null
      correct_answer?: string[]
      explanation?: string
      difficulty?: "EASY" | "MEDIUM" | "HARD"
    }) => input,
  )
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.question_type !== undefined)
      updateData.question_type = updates.question_type
    if (updates.options !== undefined)
      updateData.options = toDbOptions(updates.options)
    if (updates.correct_answer !== undefined)
      updateData.correct_answer = updates.correct_answer
    if (updates.explanation !== undefined)
      updateData.explanation = updates.explanation || null
    if (updates.difficulty !== undefined)
      updateData.difficulty = updates.difficulty

    const { data: question, error } = await supabase
      .from("questions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const deleteQuestionFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("questions").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })

// ─── Users ───

export const getAdminUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUser[]> => {
    await requireAdmin()

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    // Get quiz attempt counts per user
    const { data: counts } = await supabaseAdmin
      .from("quiz_attempts")
      .select("user_id")
      .not("completed_at", "is", null)

    const countMap = new Map<string, number>()
    for (const row of counts ?? []) {
      countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1)
    }

    return (profiles ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      image: p.image,
      role: p.role,
      created_at: p.created_at,
      quiz_attempts_count: countMap.get(p.id) ?? 0,
    }))
  },
)

export const getAdminUserDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }): Promise<AdminUserDetail> => {
    await requireAdmin()

    const [profileRes, deptAdminsRes, maintainersRes, accessRes, statsRes] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("*").eq("id", id).single(),
        supabaseAdmin
          .from("department_admins")
          .select("department_id, departments(id, name, code)")
          .eq("user_id", id),
        supabaseAdmin
          .from("course_maintainers")
          .select(
            "course_id, courses(id, name, code, department:departments(name))",
          )
          .eq("user_id", id),
        supabaseAdmin
          .from("section_access")
          .select("section_id, sections(id, name, class:classes(name))")
          .eq("user_id", id),
        supabaseAdmin
          .from("quiz_attempts")
          .select("score, completed_at")
          .eq("user_id", id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false }),
      ])

    if (profileRes.error) throw new Error(profileRes.error.message)
    const profile = profileRes.data

    const quizzes = statsRes.data ?? []
    const avgScore =
      quizzes.length > 0
        ? quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
        : null

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.image,
      role: profile.role,
      created_at: profile.created_at,
      managed_departments: (deptAdminsRes.data ?? []).map((d) => {
        const dept = d.departments as unknown as {
          id: string
          name: string
          code: string
        }
        return { id: dept.id, name: dept.name, code: dept.code }
      }),
      maintained_courses: (maintainersRes.data ?? []).map((c) => {
        const course = c.courses as unknown as {
          id: string
          name: string
          code: string
          department: { name: string }
        }
        return {
          id: course.id,
          name: course.name,
          code: course.code,
          department_name: course.department?.name ?? "",
        }
      }),
      section_accesses: (accessRes.data ?? []).map((s) => {
        const section = s.sections as unknown as {
          id: string
          name: string
          class: { name: string }
        }
        return {
          id: section.id,
          name: section.name,
          class_name: section.class?.name ?? "",
        }
      }),
      stats: {
        total_quizzes: quizzes.length,
        average_score: avgScore,
        last_quiz_at: quizzes[0]?.completed_at ?? null,
      },
    }
  })

export const updateUserRoleFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; role: UserRole }) => input)
  .handler(async ({ data: { id, role } }) => {
    const user = await requireAdmin()
    if (user.role !== "SUPERADMIN") {
      throw new Error("Solo i superadmin possono modificare i ruoli")
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", id)

    if (error) throw new Error(error.message)
  })

export const addDepartmentAdminFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { user_id: string; department_id: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from("department_admins")
      .insert(data)

    if (error) {
      if (error.code === "23505") {
        throw new Error("L'utente è già admin di questo dipartimento")
      }
      throw new Error(error.message)
    }
  })

export const removeDepartmentAdminFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { user_id: string; department_id: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from("department_admins")
      .delete()
      .eq("user_id", data.user_id)
      .eq("department_id", data.department_id)

    if (error) throw new Error(error.message)
  })

export const addCourseMaintainerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { user_id: string; course_id: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from("course_maintainers")
      .insert(data)

    if (error) {
      if (error.code === "23505") {
        throw new Error("L'utente è già maintainer di questo corso")
      }
      throw new Error(error.message)
    }
  })

export const removeCourseMaintainerFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { user_id: string; course_id: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from("course_maintainers")
      .delete()
      .eq("user_id", data.user_id)
      .eq("course_id", data.course_id)

    if (error) throw new Error(error.message)
  })

export const addSectionAccessFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { user_id: string; section_id: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from("section_access")
      .insert(data)

    if (error) {
      if (error.code === "23505") {
        throw new Error("L'utente ha già accesso a questa sezione")
      }
      throw new Error(error.message)
    }
  })

export const removeSectionAccessFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { user_id: string; section_id: string }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from("section_access")
      .delete()
      .eq("user_id", data.user_id)
      .eq("section_id", data.section_id)

    if (error) throw new Error(error.message)
  })

export const getAllCoursesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("courses")
      .select("id, name, code, department:departments(name)")
      .order("name")

    if (error) throw new Error(error.message)
    return (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      department_name: (c.department as unknown as { name: string })?.name ?? "",
    }))
  },
)

export const getAdminUserStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUserStats> => {
    await requireAdmin()

    const [profilesRes, attemptsRes, recentRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("role"),
      supabaseAdmin
        .from("quiz_attempts")
        .select("user_id, score")
        .not("completed_at", "is", null),
      supabaseAdmin
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .not("completed_at", "is", null)
        .gte(
          "completed_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ])

    const profiles = profilesRes.data ?? []
    const attempts = attemptsRes.data ?? []

    const byRole: Record<string, number> = {}
    for (const p of profiles) {
      byRole[p.role] = (byRole[p.role] ?? 0) + 1
    }

    const avgScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : null

    const activeUserIds = new Set(attempts.map((a) => a.user_id))

    return {
      totalUsers: profiles.length,
      byRole,
      totalQuizAttempts: attempts.length,
      recentQuizAttempts: recentRes.count ?? 0,
      averageScore: avgScore,
      activeUsers: activeUserIds.size,
    }
  },
)

export const getPrivateSectionsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin()

    const { data, error } = await supabaseAdmin
      .from("sections")
      .select("id, name, class:classes(name)")
      .eq("is_public", false)
      .order("name")

    if (error) throw new Error(error.message)
    return (data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      class_name: (s.class as unknown as { name: string })?.name ?? "",
    }))
  },
)

export const getSectionAccessUsersFn = createServerFn({ method: "GET" })
  .inputValidator((input: { section_id: string }) => input)
  .handler(async ({ data: { section_id } }) => {
    await requireAdmin()

    const { data, error } = await supabaseAdmin
      .from("section_access")
      .select("user_id, profiles(id, name, email)")
      .eq("section_id", section_id)

    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => {
      const profile = row.profiles as unknown as {
        id: string
        name: string | null
        email: string | null
      }
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
      }
    })
  })

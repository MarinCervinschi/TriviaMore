import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { catalog } from "../lib/supabase.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "list_sections",
    {
      title: "List sections",
      description:
        "List sections under a course (joins course_classes -> classes -> sections) or filtered by classId. Returns the full path string for disambiguation.",
      inputSchema: {
        courseId: z.string().uuid().optional(),
        classId: z.string().uuid().optional(),
      },
    },
    async ({ courseId, classId }) => {
      if (!courseId && !classId) {
        throw new Error("Provide either courseId or classId")
      }

      if (classId) {
        const { data: cls, error: clsErr } = await catalog
          .from("classes")
          .select("id, name")
          .eq("id", classId)
          .single()
        if (clsErr) throw new Error(clsErr.message)

        const { data: sections, error: sErr } = await catalog
          .from("sections")
          .select("id, name, description, is_public, position")
          .eq("class_id", classId)
          .order("position", { ascending: true })
        if (sErr) throw new Error(sErr.message)

        return json(
          (sections ?? []).map((s) => ({
            id: s.id,
            path: `${cls.name} > ${s.name}`,
            section_name: s.name,
            section_description: s.description,
            class_name: cls.name,
            is_public: s.is_public,
          })),
        )
      }

      const { data: course, error: cErr } = await catalog
        .from("courses")
        .select("id, name, code, department:departments(name)")
        .eq("id", courseId!)
        .single()
      if (cErr) throw new Error(cErr.message)

      const { data: ccs, error: ccErr } = await catalog
        .from("course_classes")
        .select(
          "code, class_year, position, class:classes(id, name, sections(id, name, description, is_public, position))",
        )
        .eq("course_id", courseId!)
        .order("position", { ascending: true })
      if (ccErr) throw new Error(ccErr.message)

      type Section = {
        id: string
        name: string
        description: string | null
        is_public: boolean
        position: number
      }
      type ClassRow = {
        id: string
        name: string
        sections: Section[] | null
      }
      type CcRow = {
        code: string
        class_year: number
        position: number
        class: ClassRow | null
      }
      type CourseRow = { name: string; department: { name: string } }

      const courseRow = course as unknown as CourseRow
      const sections = ((ccs ?? []) as unknown as CcRow[]).flatMap((cc) => {
        const cl = cc.class
        if (!cl) return []
        return (cl.sections ?? []).map((s) => ({
          id: s.id,
          path: `${courseRow.department.name} > ${courseRow.name} > ${cl.name} > ${s.name}`,
          section_name: s.name,
          section_description: s.description,
          class_name: cl.name,
          class_code: cc.code,
          class_year: cc.class_year,
          is_public: s.is_public,
        }))
      })

      return json(sections)
    },
  )
}

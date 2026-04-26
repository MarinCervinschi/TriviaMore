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
        "List sections under a course (joins course_classes -> classes -> sections) or filtered by classId. Returns the full path string for disambiguation. Supports name search, is_public filter and result limit.",
      inputSchema: {
        courseId: z.string().uuid().optional(),
        classId: z.string().uuid().optional(),
        search: z.string().trim().min(1).optional(),
        isPublic: z.boolean().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
    },
    async ({ courseId, classId, search, isPublic, limit }) => {
      if (!courseId && !classId) {
        throw new Error("Provide either courseId or classId")
      }

      const max = limit ?? 200

      if (classId) {
        const { data: cls, error: clsErr } = await catalog
          .from("classes")
          .select("id, name")
          .eq("id", classId)
          .single()
        if (clsErr) throw new Error(clsErr.message)

        let sQuery = catalog
          .from("sections")
          .select("id, name, description, is_public, position")
          .eq("class_id", classId)
          .order("position", { ascending: true })
          .limit(max)

        if (typeof isPublic === "boolean") sQuery = sQuery.eq("is_public", isPublic)
        if (search) sQuery = sQuery.ilike("name", `%${search}%`)

        const { data: sections, error: sErr } = await sQuery
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
      const needle = search?.toLowerCase()
      const out: Array<{
        id: string
        path: string
        section_name: string
        section_description: string | null
        class_name: string
        class_code: string
        class_year: number
        is_public: boolean
      }> = []

      for (const cc of (ccs ?? []) as unknown as CcRow[]) {
        const cl = cc.class
        if (!cl) continue
        for (const s of cl.sections ?? []) {
          if (typeof isPublic === "boolean" && s.is_public !== isPublic) continue
          if (needle && !s.name.toLowerCase().includes(needle)) continue
          out.push({
            id: s.id,
            path: `${courseRow.department.name} > ${courseRow.name} > ${cl.name} > ${s.name}`,
            section_name: s.name,
            section_description: s.description,
            class_name: cl.name,
            class_code: cc.code,
            class_year: cc.class_year,
            is_public: s.is_public,
          })
          if (out.length >= max) return json(out)
        }
      }

      return json(out)
    },
  )
}

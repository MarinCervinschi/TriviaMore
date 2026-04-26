import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { catalog } from "../lib/supabase.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "list_classes",
    {
      title: "List classes",
      description:
        "List classes. With courseId: returns classes attached to that course (via course_classes M:N) including per-course metadata (code, year, mandatory). Without courseId: returns all classes globally. Supports name search, year/mandatory filters (when courseId is provided) and result limit.",
      inputSchema: {
        courseId: z.string().uuid().optional(),
        search: z.string().trim().min(1).optional(),
        mandatory: z.boolean().optional(),
        classYear: z.number().int().min(1).max(10).optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
    },
    async ({ courseId, search, mandatory, classYear, limit }) => {
      const max = limit ?? 200

      if (!courseId) {
        let query = catalog
          .from("classes")
          .select("id, name, description, cfu, position")
          .order("position", { ascending: true })
          .limit(max)
        if (search) query = query.ilike("name", `%${search}%`)

        const { data, error } = await query
        if (error) throw new Error(error.message)
        return json(data)
      }

      let query = catalog
        .from("course_classes")
        .select(
          "code, class_year, mandatory, curriculum, catalogue_url, position, class:classes(id, name, description, cfu)",
        )
        .eq("course_id", courseId)
        .order("position", { ascending: true })

      if (typeof mandatory === "boolean") query = query.eq("mandatory", mandatory)
      if (typeof classYear === "number") query = query.eq("class_year", classYear)

      const { data, error } = await query
      if (error) throw new Error(error.message)

      type Row = {
        code: string
        class_year: number
        mandatory: boolean
        curriculum: string | null
        catalogue_url: string | null
        position: number
        class: {
          id: string
          name: string
          description: string | null
          cfu: number | null
        } | null
      }

      const needle = search?.toLowerCase()
      const flattened: Array<{
        id: string
        name: string
        description: string | null
        cfu: number | null
        course_class: {
          code: string
          class_year: number
          mandatory: boolean
          curriculum: string | null
          catalogue_url: string | null
          position: number
        }
      }> = []

      for (const r of (data ?? []) as unknown as Row[]) {
        if (!r.class) continue
        if (needle && !r.class.name.toLowerCase().includes(needle)) continue
        flattened.push({
          id: r.class.id,
          name: r.class.name,
          description: r.class.description,
          cfu: r.class.cfu,
          course_class: {
            code: r.code,
            class_year: r.class_year,
            mandatory: r.mandatory,
            curriculum: r.curriculum,
            catalogue_url: r.catalogue_url,
            position: r.position,
          },
        })
        if (flattened.length >= max) break
      }

      return json(flattened)
    },
  )
}

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
        "List classes. With courseId: returns classes attached to that course (via course_classes M:N) including the per-course metadata (code, year, mandatory). Without courseId: returns all classes globally.",
      inputSchema: {
        courseId: z.string().uuid().optional(),
      },
    },
    async ({ courseId }) => {
      if (!courseId) {
        const { data, error } = await catalog
          .from("classes")
          .select("id, name, description, cfu, position")
          .order("position", { ascending: true })
        if (error) throw new Error(error.message)
        return json(data)
      }

      const { data, error } = await catalog
        .from("course_classes")
        .select(
          "code, class_year, mandatory, curriculum, catalogue_url, position, class:classes(id, name, description, cfu)",
        )
        .eq("course_id", courseId)
        .order("position", { ascending: true })
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

      const flattened = ((data ?? []) as unknown as Row[])
        .filter((r) => r.class !== null)
        .map((r) => ({
          id: r.class!.id,
          name: r.class!.name,
          description: r.class!.description,
          cfu: r.class!.cfu,
          course_class: {
            code: r.code,
            class_year: r.class_year,
            mandatory: r.mandatory,
            curriculum: r.curriculum,
            catalogue_url: r.catalogue_url,
            position: r.position,
          },
        }))

      return json(flattened)
    },
  )
}

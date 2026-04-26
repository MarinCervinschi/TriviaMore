import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { catalog } from "../lib/supabase.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "list_courses",
    {
      title: "List courses",
      description:
        "List courses in the catalog, optionally filtered by departmentId. Supports name/code search, course_type and location filters, and result limit. Includes department info for context.",
      inputSchema: {
        departmentId: z.string().uuid().optional(),
        search: z.string().trim().min(1).optional(),
        courseType: z.string().trim().min(1).optional(),
        location: z.string().trim().min(1).optional(),
        limit: z.number().int().min(1).max(200).optional(),
      },
    },
    async ({ departmentId, search, courseType, location, limit }) => {
      let query = catalog
        .from("courses")
        .select(
          "id, name, code, description, course_type, location, cfu, department:departments(id, name, code)",
        )
        .order("position", { ascending: true })
        .limit(limit ?? 100)

      if (departmentId) query = query.eq("department_id", departmentId)
      if (courseType) query = query.eq("course_type", courseType)
      if (location) query = query.ilike("location", `%${location}%`)
      if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return json(data)
    },
  )
}

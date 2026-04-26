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
        "List courses in the catalog, optionally filtered by departmentId. Includes department info for context.",
      inputSchema: {
        departmentId: z.string().uuid().optional(),
      },
    },
    async ({ departmentId }) => {
      let query = catalog
        .from("courses")
        .select(
          "id, name, code, description, course_type, location, cfu, department:departments(id, name, code)",
        )
        .order("position", { ascending: true })
      if (departmentId) query = query.eq("department_id", departmentId)
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return json(data)
    },
  )
}

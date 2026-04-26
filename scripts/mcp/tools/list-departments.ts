import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { catalog } from "../lib/supabase.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "list_departments",
    {
      title: "List departments",
      description:
        "List departments in the catalog, ordered by position. Supports name/code search, area filter and result limit.",
      inputSchema: {
        search: z.string().trim().min(1).optional(),
        area: z.string().trim().min(1).optional(),
        limit: z.number().int().min(1).max(200).optional(),
      },
    },
    async ({ search, area, limit }) => {
      let query = catalog
        .from("departments")
        .select("id, name, code, description, area, position")
        .order("position", { ascending: true })
        .limit(limit ?? 100)

      if (area) query = query.eq("area", area)
      if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return json(data)
    },
  )
}

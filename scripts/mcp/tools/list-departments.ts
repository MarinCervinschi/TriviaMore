import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { catalog } from "../lib/supabase.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "list_departments",
    {
      title: "List departments",
      description: "List all departments in the catalog, ordered by position.",
      inputSchema: {},
    },
    async () => {
      const { data, error } = await catalog
        .from("departments")
        .select("id, name, code, description, area, position")
        .order("position", { ascending: true })
      if (error) throw new Error(error.message)
      return json(data)
    },
  )
}

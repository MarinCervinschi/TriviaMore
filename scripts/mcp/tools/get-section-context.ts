import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { catalog } from "../lib/supabase.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "get_section_context",
    {
      title: "Get section context",
      description:
        "Get section info + total question count + the 5 most recent questions. Use this to match style and avoid duplicates before generating new ones.",
      inputSchema: {
        sectionId: z.string().uuid(),
      },
    },
    async ({ sectionId }) => {
      const { data: section, error: sErr } = await catalog
        .from("sections")
        .select("id, name, description, is_public, class:classes(name)")
        .eq("id", sectionId)
        .single()
      if (sErr) throw new Error(sErr.message)

      const { count, error: countErr } = await catalog
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("section_id", sectionId)
      if (countErr) throw new Error(countErr.message)

      const { data: recent, error: qErr } = await catalog
        .from("questions")
        .select(
          "content, question_type, difficulty, options, correct_answer, explanation, created_at",
        )
        .eq("section_id", sectionId)
        .order("created_at", { ascending: false })
        .limit(5)
      if (qErr) throw new Error(qErr.message)

      return json({
        section,
        total_questions: count ?? 0,
        recent_questions: recent,
      })
    },
  )
}

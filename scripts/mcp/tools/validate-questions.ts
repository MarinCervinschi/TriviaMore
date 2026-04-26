import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { QuestionsArraySchema } from "../lib/schemas.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "validate_questions",
    {
      title: "Validate questions",
      description:
        "Validate an array of question objects against the schema. Does NOT write to the DB. Use before save_questions_batch.",
      inputSchema: {
        questions: z.array(z.unknown()),
      },
    },
    async ({ questions }) => {
      const result = QuestionsArraySchema.safeParse(questions)
      if (!result.success) {
        return json({ valid: false, errors: result.error.format() })
      }
      return json({ valid: true, count: result.data.length })
    },
  )
}

import fs from "node:fs/promises"
import path from "node:path"

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { QuestionsArraySchema } from "../lib/schemas.ts"
import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "save_questions_batch",
    {
      title: "Save questions batch",
      description:
        "Validate and save the batch as JSON to pending-questions/<filename>. Returns the file path and the upload URL for the admin UI.",
      inputSchema: {
        sectionId: z.string().uuid(),
        questions: z.array(z.unknown()),
        filename: z.string().optional(),
      },
    },
    async ({ sectionId, questions, filename }) => {
      const result = QuestionsArraySchema.safeParse(questions)
      if (!result.success) {
        throw new Error(
          `Validation failed: ${JSON.stringify(result.error.format())}`,
        )
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19)
      const finalName = filename ?? `${timestamp}-${sectionId.slice(0, 8)}.json`
      const dir = path.join(process.cwd(), "pending-questions")
      await fs.mkdir(dir, { recursive: true })
      const fullPath = path.join(dir, finalName)
      await fs.writeFile(fullPath, JSON.stringify(result.data, null, 2) + "\n")

      return json({
        saved: true,
        path: fullPath,
        relative_path: path.relative(process.cwd(), fullPath),
        count: result.data.length,
        section_id: sectionId,
        upload_url: `/admin/questions/new?sectionId=${sectionId}`,
        next_step:
          "User opens upload_url, clicks 'Import JSON' tab, pastes the file contents, clicks 'Importa domande'.",
      })
    },
  )
}

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { json } from "../lib/utils.ts"

export function register(server: McpServer) {
  server.registerTool(
    "get_question_format",
    {
      title: "Get question format",
      description:
        "Returns the exact JSON shape expected by the BulkImportForm UI. The agent MUST follow this format.",
      inputSchema: {},
    },
    async () => {
      return json({
        description:
          "Output an array of question objects. The UI injects section_id automatically from the URL — do NOT include it in the JSON.",
        enums: {
          question_type: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
          difficulty: ["EASY", "MEDIUM", "HARD"],
        },
        rules: [
          "content: 10-2000 chars, trimmed",
          "options: required for MULTIPLE_CHOICE (>=2, <=6); use ['Vero','Falso'] for TRUE_FALSE; omit/null for SHORT_ANSWER",
          "correct_answer: 1-6 non-empty strings; for MULTIPLE_CHOICE these must match entries in options",
          "explanation: optional, <=1000 chars; recommended for ~80% of questions",
          "DO NOT include section_id",
        ],
        example: [
          {
            content: "Qual è la capitale d'Italia?",
            question_type: "MULTIPLE_CHOICE",
            options: ["Roma", "Milano", "Napoli", "Torino"],
            correct_answer: ["Roma"],
            explanation: "Roma è la capitale dal 1871.",
            difficulty: "EASY",
          },
          {
            content: "Il sole è una stella",
            question_type: "TRUE_FALSE",
            options: ["Vero", "Falso"],
            correct_answer: ["Vero"],
            difficulty: "EASY",
          },
        ],
      })
    },
  )
}

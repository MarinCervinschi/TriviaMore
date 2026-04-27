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
          "options: ALWAYS a flat array of plain strings — never objects like {id,text}",
          "options: required for MULTIPLE_CHOICE (>=2, <=6); use ['Vero','Falso'] for TRUE_FALSE; omit/null for SHORT_ANSWER",
          "correct_answer: 1-6 non-empty strings; for MULTIPLE_CHOICE each entry must be a byte-for-byte exact match of one of the options strings (same whitespace, same LaTeX) — scoring is literal string comparison",
          "explanation: optional, <=1000 chars; recommended for ~80% of questions",
          "DO NOT include section_id",
        ],
        latex: {
          renderer: "KaTeX (remark-math + rehype-katex)",
          inline: "$...$",
          block: "$$...$$",
          forbidden: ["\\(...\\)", "\\[...\\]"],
          json_escaping:
            "Inside JSON strings, every backslash must be doubled. LaTeX `\\sigma(x) = \\dfrac{1}{1+e^{-x}}` becomes JSON `\"$\\\\sigma(x) = \\\\dfrac{1}{1+e^{-x}}$\"`",
          tips: [
            "Multi-character super/subscripts need braces: e^{-x}, f_{y_i} — never e^-x",
            "Use \\geq \\leq \\neq \\cdot \\times \\approx (not >=, <=, !=)",
            "Functions get backslash for upright font: \\max \\min \\log \\exp \\sin",
            "Greek letters: \\sigma \\alpha \\theta \\lambda — don't mix Unicode σ inside math",
            "Mix prose and math, don't wrap whole sentences: 'La derivata $\\frac{d}{dx} f(x)$ è positiva...'",
            "When the correct option contains LaTeX, copy the EXACT same string into correct_answer — do not paraphrase or swap \\frac for \\dfrac",
          ],
        },
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
          {
            content:
              "Quale è la definizione della funzione sigmoide $\\sigma(x)$?",
            question_type: "MULTIPLE_CHOICE",
            options: [
              "$\\sigma(x) = \\dfrac{1}{1 + e^{-x}}$",
              "$\\sigma(x) = \\max(0, x)$",
              "$\\sigma(x) = \\dfrac{e^x - e^{-x}}{e^x + e^{-x}}$",
              "$\\sigma(x) = \\dfrac{e^x}{1 + e^x} - 1$",
            ],
            correct_answer: ["$\\sigma(x) = \\dfrac{1}{1 + e^{-x}}$"],
            explanation:
              "La sigmoide standard mappa $\\mathbb{R} \\to (0,1)$ ed è il caso classico di attivazione logistica.",
            difficulty: "MEDIUM",
          },
        ],
      })
    },
  )
}

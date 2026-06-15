import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { z } from "zod"

import {
  correctLetters,
  parseAnswers,
  parseQuestions,
  type ParsedAnswer,
  type ParsedQuestion,
} from "../lib/parse-markdown.ts"
import { QuestionsArraySchema } from "../lib/schemas.ts"
import { json } from "../lib/utils.ts"

// Merge the two parsed sides into question objects. Option letters are resolved to the exact
// option string here, so correct_answer matches byte-for-byte by construction.
function build(questions: ParsedQuestion[], answers: Map<number, ParsedAnswer>) {
  const errors: string[] = []
  const objects: unknown[] = []
  const questionNums = new Set(questions.map((q) => q.n))

  for (const n of answers.keys()) {
    if (!questionNums.has(n)) errors.push(`answers.md has Q${n} with no matching question`)
  }

  for (const q of [...questions].sort((a, b) => a.n - b.n)) {
    const where = `Q${q.n}`
    if (!q.type) {
      errors.push(`${where}: missing or unknown question type in header`)
      continue
    }
    if (!q.difficulty) {
      errors.push(`${where}: missing or unknown difficulty in header`)
      continue
    }
    const content = q.contentLines.join("\n").trim()
    if (!content) {
      errors.push(`${where}: empty stem`)
      continue
    }
    const answer = answers.get(q.n)
    if (!answer) {
      errors.push(`${where}: no answer entry in answers.md`)
      continue
    }

    let options: string[] | undefined
    let correctAnswer: string[]

    if (q.type === "SHORT_ANSWER") {
      if (q.options.length) errors.push(`${where}: SHORT_ANSWER must not list options`)
      if (!answer.correct) {
        errors.push(`${where}: missing 'correct:' answer`)
        continue
      }
      correctAnswer = [answer.correct, ...answer.accepted].filter(Boolean)
    } else {
      if (q.options.length < 2) {
        errors.push(`${where}: needs at least 2 options`)
        continue
      }
      options = q.options.map((o) => o.text)
      const letters = correctLetters(answer.correct)
      if (!letters.length) {
        errors.push(`${where}: missing 'correct:' letter(s)`)
        continue
      }
      correctAnswer = []
      for (const letter of letters) {
        const opt = q.options.find((o) => o.letter === letter)
        if (!opt) {
          errors.push(`${where}: 'correct: ${letter}' has no matching option`)
          continue
        }
        correctAnswer.push(opt.text)
      }
      if (!correctAnswer.length) continue
    }

    objects.push({
      content,
      question_type: q.type,
      ...(options ? { options } : {}),
      correct_answer: correctAnswer,
      ...(answer.explanation ? { explanation: answer.explanation } : {}),
      difficulty: q.difficulty,
    })
  }
  return { objects, errors }
}

export function register(server: McpServer) {
  server.registerTool(
    "compile_questions",
    {
      title: "Compile questions",
      description:
        "Read a questions.md + answers.md pair, assemble the canonical question array (mapping option letters to their exact strings and escaping LaTeX automatically via JSON), validate it against the schema, and write pending-questions/<timestamp>-<slug>.json. Returns the written path, or parse/schema errors without writing. Lets you draft in plain markdown and never hand-escape JSON.",
      inputSchema: {
        questionsPath: z
          .string()
          .describe("Absolute path to questions.md (stems + lettered options, no answer key)."),
        answersPath: z
          .string()
          .describe("Absolute path to answers.md (correct letters/text + optional explanations)."),
        slug: z
          .string()
          .describe("2-3 word kebab summary for the output filename, e.g. 'tcp-handshake'."),
        outDir: z
          .string()
          .optional()
          .describe("Output directory, relative to repo root. Default: pending-questions."),
      },
    },
    async ({ questionsPath, answersPath, slug, outDir }) => {
      let questionsMd: string
      let answersMd: string
      try {
        questionsMd = readFileSync(questionsPath, "utf8")
        answersMd = readFileSync(answersPath, "utf8")
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e)
        return json({ ok: false, stage: "read", error })
      }

      const questions = parseQuestions(questionsMd)
      const answers = parseAnswers(answersMd)
      if (!questions.length) {
        return json({
          ok: false,
          stage: "parse",
          errors: ["no questions found — expected '## Q<n>  [TYPE · DIFFICULTY]' headers in questions.md"],
        })
      }

      const { objects, errors } = build(questions, answers)
      if (errors.length) return json({ ok: false, stage: "parse", errors })

      const parsed = QuestionsArraySchema.safeParse(objects)
      if (!parsed.success) {
        return json({ ok: false, stage: "schema", errors: parsed.error.format() })
      }

      const timestamp = new Date().toISOString().replace(/\.\d+Z$/, "").replace(/:/g, "-")
      const cleanSlug =
        slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "questions"
      const dir = resolve(process.cwd(), outDir ?? "pending-questions")
      const file = `${timestamp}-${cleanSlug}.json`
      const fullPath = resolve(dir, file)
      try {
        mkdirSync(dir, { recursive: true })
        writeFileSync(fullPath, `${JSON.stringify(parsed.data, null, 2)}\n`, "utf8")
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e)
        return json({ ok: false, stage: "write", error })
      }

      return json({ ok: true, path: fullPath, file, count: parsed.data.length })
    },
  )
}

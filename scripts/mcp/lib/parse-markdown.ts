export const TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"] as const
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const

export type QType = (typeof TYPES)[number]
export type QDiff = (typeof DIFFICULTIES)[number]

export interface ParsedQuestion {
  n: number
  type: QType | null
  difficulty: QDiff | null
  contentLines: string[]
  options: { letter: string; text: string }[]
}

export interface ParsedAnswer {
  correct: string
  accepted: string[]
  explanation?: string
}

const Q_HEADER = /^##\s*Q(\d+)\b(.*)$/
const OPTION = /^[-*]\s+([A-Za-z])\)\s*(.*)$/
const A_HEADER = /^##\s*Q(\d+)\b/
const FIELD = /^([A-Za-z-]+)\s*:\s*(.*)$/

// questions.md: `## Q<n>  [TYPE · DIFFICULTY]` headers, lettered option lines, stem in between.
export function parseQuestions(md: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  let cur: ParsedQuestion | null = null

  for (const line of md.split(/\r?\n/)) {
    const header = Q_HEADER.exec(line)
    if (header) {
      cur = {
        n: Number(header[1]),
        type: TYPES.find((t) => header[2].includes(t)) ?? null,
        difficulty: DIFFICULTIES.find((d) => header[2].includes(d)) ?? null,
        contentLines: [],
        options: [],
      }
      questions.push(cur)
      continue
    }
    if (!cur) continue
    const option = OPTION.exec(line)
    if (option) {
      cur.options.push({ letter: option[1].toUpperCase(), text: option[2].trim() })
    } else {
      cur.contentLines.push(line)
    }
  }
  return questions
}

// answers.md: `## Q<n>` headers, then `correct:` / `also-accepted:` / `explanation:` fields.
export function parseAnswers(md: string): Map<number, ParsedAnswer> {
  const answers = new Map<number, ParsedAnswer>()
  let n: number | null = null

  for (const line of md.split(/\r?\n/)) {
    const header = A_HEADER.exec(line)
    if (header) {
      n = Number(header[1])
      answers.set(n, { correct: "", accepted: [] })
      continue
    }
    if (n == null) continue
    const field = FIELD.exec(line)
    if (!field) continue
    const key = field[1].toLowerCase()
    const value = field[2].trim()
    const answer = answers.get(n)!
    if (key === "correct") answer.correct = value
    else if (key === "also-accepted")
      answer.accepted = value.split("|").map((s) => s.trim()).filter(Boolean)
    else if (key === "explanation") answer.explanation = value
  }
  return answers
}

// Split a `correct:` field into normalized uppercase option letters.
export function correctLetters(correct: string): string[] {
  return correct
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
}

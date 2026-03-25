import type { Json } from "@/lib/supabase/database.types"

export type QuestionOption = {
  id: string
  text: string
}

/** Parse question options from JSONB — supports both {id,text} objects and plain strings */
export function parseOptions(options: Json | null): QuestionOption[] {
  if (!Array.isArray(options)) return []

  return options
    .map((item, index) => {
      if (typeof item === "string") {
        return { id: item, text: item }
      }
      if (
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        "text" in item
      ) {
        const obj = item as { id?: string; text: string }
        return {
          id: obj.id ?? String.fromCharCode(97 + index),
          text: String(obj.text),
        }
      }
      return null
    })
    .filter((o): o is QuestionOption => o !== null)
}

/** Check if an option id is in the correct_answer array */
export function isCorrectOption(
  optionId: string,
  correctAnswer: string[],
): boolean {
  return correctAnswer.includes(optionId)
}

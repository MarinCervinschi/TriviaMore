import { z } from "zod"

// Mirrors src/lib/shared/question-schema.ts (without section_id; UI injects it)
export const QuestionInputSchema = z
  .object({
    content: z.string().min(10).max(2000).trim(),
    question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
    options: z.array(z.string().min(1)).min(2).max(6).nullable().optional(),
    correct_answer: z.array(z.string().min(1)).min(1).max(6),
    explanation: z.string().max(1000).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  })
  .superRefine((data, ctx) => {
    if (data.question_type === "MULTIPLE_CHOICE") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "MULTIPLE_CHOICE questions must have at least 2 options",
          path: ["options"],
        })
      }
    }
  })

export const QuestionsArraySchema = z.array(QuestionInputSchema)

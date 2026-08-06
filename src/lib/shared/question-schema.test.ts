import { describe, expect, it } from "vitest"
import { z } from "zod"

import { questionFieldsSchema, questionMcRefinement } from "./question-schema"

const validMultipleChoice = {
  content: "Qual è la capitale d'Italia?",
  question_type: "MULTIPLE_CHOICE" as const,
  options: ["Roma", "Milano"],
  correct_answer: ["Roma"],
  difficulty: "EASY" as const,
}

describe("questionFieldsSchema", () => {
  it("accepts a well-formed question", () => {
    expect(questionFieldsSchema.safeParse(validMultipleChoice).success).toBe(true)
  })

  it("trims the content before validating length", () => {
    const parsed = questionFieldsSchema.parse({
      ...validMultipleChoice,
      content: "  Domanda con spazi  ",
    })
    expect(parsed.content).toBe("Domanda con spazi")
  })

  it("rejects content shorter than 10 characters", () => {
    const result = questionFieldsSchema.safeParse({
      ...validMultipleChoice,
      content: "corta",
    })
    expect(result.success).toBe(false)
  })

  it("requires at least one correct answer", () => {
    const result = questionFieldsSchema.safeParse({
      ...validMultipleChoice,
      correct_answer: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects an unknown question type", () => {
    const result = questionFieldsSchema.safeParse({
      ...validMultipleChoice,
      question_type: "ESSAY",
    })
    expect(result.success).toBe(false)
  })
})

describe("questionMcRefinement", () => {
  const refined = questionFieldsSchema.superRefine(questionMcRefinement)

  it("flags a multiple-choice question with no options", () => {
    const result = refined.safeParse({
      ...validMultipleChoice,
      options: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["options"])
    }
  })

  it("accepts a multiple-choice question with two options", () => {
    expect(refined.safeParse(validMultipleChoice).success).toBe(true)
  })

  it("does not constrain non-multiple-choice types", () => {
    const result = refined.safeParse({
      content: "Vero o falso: il cielo è blu.",
      question_type: "TRUE_FALSE" as const,
      options: null,
      correct_answer: ["Vero"],
      difficulty: "EASY" as const,
    })
    expect(result.success).toBe(true)
  })
})

// Zod is a peer of the validation contract; a smoke check keeps the import honest.
it("uses the same zod instance the schema was built with", () => {
  expect(questionFieldsSchema).toBeInstanceOf(z.ZodObject)
})

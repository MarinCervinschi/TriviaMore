import { z } from "zod"

import { questionFieldsSchema, questionMcRefinement } from "@/lib/shared/question-schema"

// Section submission: user proposes a new section for a class
export const sectionSubmissionSchema = z.object({
  type: z.literal("section"),
  target_class_id: z.string().min(1, "La classe è obbligatoria"),
  name: z
    .string()
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri")
    .trim(),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional()
    .or(z.literal("")),
})

// Questions submission: user proposes questions for an existing section
export const questionsSubmissionSchema = z.object({
  type: z.literal("questions"),
  target_section_id: z.string().min(1, "La sezione è obbligatoria"),
  questions: z
    .array(questionFieldsSchema.superRefine(questionMcRefinement))
    .min(1, "Devi proporre almeno una domanda"),
})

// Union — the form submits one of these
export const contentSubmissionSchema = z.discriminatedUnion("type", [
  sectionSubmissionSchema,
  questionsSubmissionSchema,
])

export type SectionSubmissionInput = z.infer<typeof sectionSubmissionSchema>
export type QuestionsSubmissionInput = z.infer<typeof questionsSubmissionSchema>
export type ContentSubmissionInput = z.infer<typeof contentSubmissionSchema>

// Report submission: user flags a question
export const reportSubmissionSchema = z
  .object({
    type: z.literal("report"),
    question_id: z.string().min(1, "La domanda è obbligatoria"),
    question_content: z.string().trim(),
    reasons: z
      .array(z.enum(["errata", "imprecisa", "fuori_contesto", "altro"]))
      .min(1, "Seleziona almeno un motivo"),
    comment: z.string().max(1000).nullable(),
  })
  .refine(
    (data) => {
      if (data.reasons.includes("altro")) {
        return data.comment && data.comment.trim().length > 0
      }
      return true
    },
    {
      message: "Il commento è obbligatorio quando si seleziona 'Altro'",
      path: ["comment"],
    },
  )

export type ReportSubmissionInput = z.infer<typeof reportSubmissionSchema>

// File upload submission: user uploads a file contribution
export const fileUploadSubmissionSchema = z.object({
  type: z.literal("file_upload"),
  file_name: z.string().min(1, "Il nome del file è obbligatorio").trim(),
  file_path: z.string().min(1, "Il percorso del file è obbligatorio"),
  file_size: z.number().min(0),
  comment: z.string().max(1000).nullable(),
})

export type FileUploadSubmissionInput = z.infer<typeof fileUploadSubmissionSchema>

// ─── Stored JSONB validation (content only, no target fields) ───

const storedSectionSchema = z.object({
  type: z.literal("section"),
  name: z.string().min(1),
  description: z.string(),
})

const storedQuestionsSchema = z.object({
  type: z.literal("questions"),
  questions: z.array(
    z.object({
      content: z.string().min(1),
      question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
      options: z.array(z.string()).nullable(),
      correct_answer: z.array(z.string()),
      explanation: z.string().nullable(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    }),
  ),
})

const storedReportSchema = z.object({
  type: z.literal("report"),
  question_id: z.string().min(1),
  question_content: z.string(),
  reasons: z.array(z.string()).min(1),
  comment: z.string().nullable(),
})

export const storedContentSchema = z.discriminatedUnion("type", [
  storedSectionSchema,
  storedQuestionsSchema,
  storedReportSchema,
  fileUploadSubmissionSchema,
])

// Admin action schema (unchanged)
export const handleRequestSchema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
  admin_note: z.string().max(1000).trim().optional(),
})

export type HandleRequestInput = z.infer<typeof handleRequestSchema>

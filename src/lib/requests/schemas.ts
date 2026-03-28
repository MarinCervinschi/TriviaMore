import { z } from "zod"

// Shared question schema (same validation as admin)
const submittedQuestionSchema = z.object({
  content: z
    .string()
    .min(10, "Il contenuto deve essere di almeno 10 caratteri")
    .max(2000, "Il contenuto non può superare i 2000 caratteri")
    .trim(),
  question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"], {
    message: "Il tipo di domanda è obbligatorio",
  }),
  options: z
    .array(z.string().min(1, "L'opzione non può essere vuota"))
    .min(2, "Devono esserci almeno 2 opzioni")
    .max(6, "Non possono esserci più di 6 opzioni")
    .optional()
    .nullable(),
  correct_answer: z
    .array(z.string().min(1, "La risposta corretta non può essere vuota"))
    .min(1, "Deve esserci almeno una risposta corretta")
    .max(6, "Non possono esserci più di 6 risposte corrette"),
  explanation: z
    .string()
    .max(1000, "La spiegazione non può superare i 1000 caratteri")
    .optional()
    .or(z.literal("")),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    message: "La difficoltà è obbligatoria",
  }),
})

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
    .array(
      submittedQuestionSchema.superRefine((data, ctx) => {
        if (data.question_type === "MULTIPLE_CHOICE") {
          if (!data.options || data.options.length < 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Le domande a scelta multipla devono avere almeno 2 opzioni",
              path: ["options"],
            })
          }
        }
      }),
    )
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

// Admin action schema (unchanged)
export const handleRequestSchema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
  admin_note: z.string().max(1000).trim().optional(),
})

export type HandleRequestInput = z.infer<typeof handleRequestSchema>

import { z } from "zod"

/**
 * Shared question field validation — used by both admin and user submission schemas.
 * Admin extends with section_id; requests uses as-is.
 */
export const questionFieldsSchema = z.object({
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

/** MC questions must have at least 2 options */
export const questionMcRefinement = (
  data: z.infer<typeof questionFieldsSchema>,
  ctx: z.RefinementCtx,
) => {
  if (data.question_type === "MULTIPLE_CHOICE") {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le domande a scelta multipla devono avere almeno 2 opzioni",
        path: ["options"],
      })
    }
  }
}

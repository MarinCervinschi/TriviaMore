import { z } from "zod"

export const contentRequestSchema = z
  .object({
    request_type: z.enum([
      "NEW_SECTION",
      "NEW_QUESTIONS",
      "ERROR_REPORT",
      "CONTENT_REQUEST",
    ]),
    title: z
      .string()
      .min(5, "Il titolo deve essere di almeno 5 caratteri")
      .max(200, "Il titolo non puo superare i 200 caratteri")
      .trim(),
    description: z
      .string()
      .min(10, "La descrizione deve essere di almeno 10 caratteri")
      .max(2000, "La descrizione non puo superare i 2000 caratteri")
      .trim(),
    target_department_id: z.string().nullish(),
    target_course_id: z.string().nullish(),
    target_class_id: z.string().nullish(),
    target_section_id: z.string().nullish(),
    question_id: z.string().nullish(),
  })
  .refine(
    (data) =>
      data.target_department_id ||
      data.target_course_id ||
      data.target_class_id ||
      data.target_section_id,
    {
      message: "Devi selezionare un target per la richiesta",
      path: ["target_department_id"],
    },
  )

export type ContentRequestInput = z.infer<typeof contentRequestSchema>

export const handleRequestSchema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
  admin_note: z.string().max(1000).optional(),
})

export type HandleRequestInput = z.infer<typeof handleRequestSchema>

export const reviseRequestSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(5, "Il titolo deve essere di almeno 5 caratteri")
    .max(200)
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, "La descrizione deve essere di almeno 10 caratteri")
    .max(2000)
    .trim()
    .optional(),
})

export type ReviseRequestInput = z.infer<typeof reviseRequestSchema>

export const requestCommentSchema = z.object({
  request_id: z.string(),
  content: z
    .string()
    .min(1, "Il commento non puo essere vuoto")
    .max(1000, "Il commento non puo superare i 1000 caratteri")
    .trim(),
})

export type RequestCommentInput = z.infer<typeof requestCommentSchema>

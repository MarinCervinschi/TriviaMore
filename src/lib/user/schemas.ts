import { z } from "zod"

export const classRefSchema = z.object({
  classId: z.string().uuid(),
  courseId: z.string().uuid(),
})

export const classIdSchema = z.object({ classId: z.string().uuid() })
export const questionIdSchema = z.object({ questionId: z.string().uuid() })

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio").max(100),
  image: z.string().url().nullable().optional(),
})

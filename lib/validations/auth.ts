import { z } from "zod"

// Base user schema
export const userBaseSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z.email("Email non valida"),
  username: z.string().min(3, "Lo username deve essere di almeno 3 caratteri"),
})

// Authentication schemas
export const registerSchema = userBaseSchema.extend({
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
})

export const loginSchema = z.object({
  username: z.string().min(1, "Username richiesto"),
  password: z.string().min(1, "Password richiesta"),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
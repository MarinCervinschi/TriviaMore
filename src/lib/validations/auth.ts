import { z } from "zod"

// Base user schema
export const userBaseSchema = z.object({
  name: z.string()
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(50, "Il nome non può superare i 50 caratteri")
    .regex(/^[a-zA-Z0-9._]+$/, "Il nome può contenere solo lettere, numeri, punti e underscore")
    .refine((name) => !name.startsWith('.') && !name.endsWith('.'), "Il nome non può iniziare o finire con un punto")
    .refine((name) => !name.startsWith('_') && !name.endsWith('_'), "Il nome non può iniziare o finire con un underscore")
    .refine((name) => !/[._]{2,}/.test(name), "Il nome non può contenere punti o underscore consecutivi"),
  email: z.email("Email non valida")
    .max(100, "L'email non può superare i 100 caratteri")
    .toLowerCase(),
})

// Authentication schemas
export const registerSchema = userBaseSchema.extend({
  password: z.string()
    .min(6, "La password deve essere di almeno 6 caratteri")
    .max(100, "La password non può superare i 100 caratteri")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La password deve contenere almeno una lettera minuscola, una maiuscola e un numero")
    .refine((password) => !/\s/.test(password), "La password non può contenere spazi"),
})

export const loginSchema = z.object({
  email: z.email("Email non valida")
    .max(100, "L'email non può superare i 100 caratteri")
    .toLowerCase(),
  password: z.string()
    .min(1, "Password richiesta")
    .max(100, "La password non può superare i 100 caratteri"),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
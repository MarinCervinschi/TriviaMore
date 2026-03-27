import { z } from "zod"

const userBaseSchema = z.object({
  name: z
    .string()
    .min(2, "Il nome deve essere di almeno 2 caratteri")
    .max(50, "Il nome non può superare i 50 caratteri")
    .regex(
      /^[\p{L}\p{M}][\p{L}\p{M}\s'.,-]*[\p{L}\p{M}.]$/u,
      "Il nome deve iniziare e finire con una lettera e può contenere spazi, apostrofi e trattini",
    )
    .refine(
      (name) => !/\s{2,}/.test(name),
      "Il nome non può contenere spazi consecutivi",
    ),
  email: z
    .email("Email non valida")
    .max(100, "L'email non può superare i 100 caratteri")
    .toLowerCase(),
})

export const registerSchema = userBaseSchema.extend({
  password: z
    .string()
    .min(6, "La password deve essere di almeno 6 caratteri")
    .max(100, "La password non può superare i 100 caratteri")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La password deve contenere almeno una lettera minuscola, una maiuscola e un numero",
    )
    .refine(
      (password) => !/\s/.test(password),
      "La password non può contenere spazi",
    ),
})

export const loginSchema = z.object({
  email: z
    .email("Email non valida")
    .max(100, "L'email non può superare i 100 caratteri")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password richiesta")
    .max(100, "La password non può superare i 100 caratteri"),
})

export const oauthProviderSchema = z.object({
  provider: z.enum(["github", "google"]),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OAuthProviderInput = z.infer<typeof oauthProviderSchema>

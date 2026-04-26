import { z } from "zod"

export const contactTypeOptions = [
  { value: "bug", label: "Segnalazione Bug" },
  { value: "feature", label: "Proposta Funzionalità" },
  { value: "content", label: "Contenuti Corso" },
  { value: "other", label: "Altro" },
] as const

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri")
    .trim(),
  email: z
    .string()
    .email("Inserisci un indirizzo email valido")
    .max(100, "L'email non può superare i 100 caratteri")
    .trim(),
  type: z.enum(["bug", "feature", "content", "other"], {
    message: "Seleziona un tipo di messaggio",
  }),
  subject: z
    .string()
    .min(5, "L'oggetto deve avere almeno 5 caratteri")
    .max(200, "L'oggetto non può superare i 200 caratteri")
    .trim(),
  message: z
    .string()
    .min(10, "Il messaggio deve avere almeno 10 caratteri")
    .max(5000, "Il messaggio non può superare i 5000 caratteri")
    .trim(),
  // Honeypot: invisible to real users, bots tend to fill any field they see.
  // Validated as optional/empty here; the server treats any non-empty value
  // as a bot submission and silently drops it.
  website: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

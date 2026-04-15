import { z } from "zod"

export const changelogSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+$/, "Formato versione non valido (es. 3.0)")
    .trim(),
  title: z
    .string()
    .min(3, "Il titolo deve essere di almeno 3 caratteri")
    .max(200, "Il titolo non può superare i 200 caratteri")
    .trim(),
  body: z
    .string()
    .min(10, "Il contenuto deve essere di almeno 10 caratteri")
    .max(50000, "Il contenuto non può superare i 50000 caratteri"),
  category: z.enum(["new", "improved", "fixed"], {
    message: "La categoria è obbligatoria",
  }),
})

export type ChangelogInput = z.infer<typeof changelogSchema>

export const updateChangelogSchema = changelogSchema.partial()

export type UpdateChangelogInput = z.infer<typeof updateChangelogSchema>

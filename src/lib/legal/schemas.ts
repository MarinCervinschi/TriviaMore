import { z } from "zod"

/**
 * Schema used by the registration form and /legal/accept page.
 * Both checkboxes must be literal `true` to pass validation.
 */
export const acceptLegalSchema = z.object({
  terms_accepted: z
    .boolean()
    .refine((v) => v === true, {
      message: "Devi accettare i Termini e Condizioni per continuare",
    }),
  privacy_accepted: z
    .boolean()
    .refine((v) => v === true, {
      message: "Devi accettare l'Informativa sulla Privacy per continuare",
    }),
})

export type AcceptLegalInput = z.infer<typeof acceptLegalSchema>

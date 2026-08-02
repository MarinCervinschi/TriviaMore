import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { errorMiddleware } from "@/lib/server/middleware/errors"

export const resendConfirmationFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(z.object({ email: z.email() }))
  .handler(async ({ data }) => {
    const { error } = await createServerSupabaseClient().auth.resend({
      type: "signup",
      email: data.email,
    })
    if (error) return { success: false as const, error: error.message }
    return { success: true as const }
  })

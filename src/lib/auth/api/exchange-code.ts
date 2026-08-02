import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export const exchangeCodeFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ code: z.string().min(1) }))
  .handler(async ({ data }) => {
    await createServerSupabaseClient().auth.exchangeCodeForSession(data.code)
  })

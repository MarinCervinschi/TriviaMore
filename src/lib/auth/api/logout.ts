import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { errorMiddleware } from "@/lib/server/middleware/errors"

export const logoutFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .handler(async () => {
    const { error } = await createServerSupabaseClient().auth.signOut()
    return { success: !error }
  })

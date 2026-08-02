import { createServerFn } from "@tanstack/react-start"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { error } = await createServerSupabaseClient().auth.signOut()
    return { success: !error }
  })

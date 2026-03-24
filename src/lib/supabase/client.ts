import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "./database.types"

export function createClient() {
  return createBrowserClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}

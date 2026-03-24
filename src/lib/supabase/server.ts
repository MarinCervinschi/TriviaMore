import { createServerClient } from "@supabase/ssr"

import type { Database } from "./database.types"

// TODO: implement proper cookie handling for TanStack Start in Phase 2
export function createServerSupabaseClient() {
  return createServerClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  )
}

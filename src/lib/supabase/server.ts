import { getCookies, setCookie } from "@tanstack/react-start/server"
import { createServerClient, type SupabaseClient } from "@supabase/ssr"

import type { Database } from "./database.types"

export function createServerSupabaseClient() {
  return createServerClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookies = getCookies()
          return Object.entries(cookies).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            setCookie(name, value, options)
          }
        },
      },
    },
  )
}

export function catalogQuery(supabase: SupabaseClient) {
  return supabase.schema("catalog")
}

export function quizQuery(supabase: SupabaseClient) {
  return supabase.schema("quiz")
}

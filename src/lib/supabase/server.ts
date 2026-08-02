import { getCookies, setCookie } from "@tanstack/react-start/server"
import { createServerClient } from "@supabase/ssr"

// Auth only. Every data path goes through Drizzle.
export function createServerSupabaseClient() {
  return createServerClient(
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

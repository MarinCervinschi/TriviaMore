import { getCookies, setCookie } from "@tanstack/react-start/server"
import { createServerClient } from "@supabase/ssr"

/** The name supabase-js derives from the public URL, so the server reads the cookie the browser wrote. */
function sessionCookieName(publicUrl: string) {
  return `sb-${new URL(publicUrl).hostname.split(".")[0]}-auth-token`
}

// Auth only. Every data path goes through Drizzle.
export function createServerSupabaseClient({
  via = "internal",
}: {
  /** `public` for a call whose result the browser follows, such as an OAuth URL. */
  via?: "internal" | "public"
} = {}) {
  const publicUrl = process.env.VITE_SUPABASE_URL!
  // The Docker network address of Kong, so a session check does not leave the host.
  const url =
    via === "internal"
      ? process.env.SUPABASE_INTERNAL_URL?.trim() || publicUrl
      : publicUrl

  return createServerClient(url, process.env.VITE_SUPABASE_ANON_KEY!, {
    cookieOptions: { name: sessionCookieName(publicUrl) },
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
  })
}

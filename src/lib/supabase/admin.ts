import { createClient } from "@supabase/supabase-js"

// Only for the auth admin API and Storage; every data path goes through Drizzle.
let _admin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _admin
}

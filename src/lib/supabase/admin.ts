import { createClient } from "@supabase/supabase-js"

// Service-role client, kept for the two things that never moved to Drizzle: the
// auth admin API and Storage.
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

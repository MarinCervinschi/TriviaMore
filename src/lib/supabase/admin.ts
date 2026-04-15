import { createClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"

let _admin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient<Database>(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _admin
}

export function getCatalogAdmin() {
  return getSupabaseAdmin().schema("catalog")
}

export function getQuizAdmin() {
  return getSupabaseAdmin().schema("quiz")
}

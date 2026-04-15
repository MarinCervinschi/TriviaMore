import { createClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"

let _admin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_admin) {
    const url = process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log("[supabase-admin] URL:", url ? "SET" : "MISSING")
    console.log("[supabase-admin] SERVICE_ROLE_KEY:", key ? `SET (${key.length} chars)` : "MISSING")
    _admin = createClient<Database>(url!, key!)
  }
  return _admin
}

export function getCatalogAdmin() {
  return getSupabaseAdmin().schema("catalog")
}

export function getQuizAdmin() {
  return getSupabaseAdmin().schema("quiz")
}

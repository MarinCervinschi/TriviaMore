import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[catalog-mcp] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  )
  console.error(
    "[catalog-mcp] Run via: pnpm mcp:catalog (which wraps with infisical run --recursive)",
  )
  process.exit(1)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export const catalog = supabase.schema("catalog")

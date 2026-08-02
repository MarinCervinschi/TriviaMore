// PostgREST client for the #113 differential scripts.
//
// The app no longer talks to PostgREST, so `src/lib/supabase` has nothing left
// that reaches the catalog. These scripts still need it: they replay the
// pre-Drizzle implementation against the same database. Untyped on purpose —
// `database.types.ts` went away with the last supabase-js query path.
//
// Throwaway, like the scripts it serves.

import { createClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createClient<any, any, any>> | null = null

function rest() {
  if (!client) {
    client = createClient<any, any, any>(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return client
}

export function publicRest() {
  return rest()
}

export function catalogRest() {
  return rest().schema("catalog")
}

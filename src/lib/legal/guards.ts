import { redirect } from "@tanstack/react-router"

import { getDb } from "@/db"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import { findLatestAcceptedVersions } from "./db/legal-acceptances"
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "./versions"

// Runs after requireAuth: with no user it returns silently, because the auth
// guard wrapping it has already redirected.
export async function requireLegalAcceptance(): Promise<void> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const latest = await findLatestAcceptedVersions(getDb(), user.id)

  if (
    latest.get("TERMS") !== CURRENT_TERMS_VERSION ||
    latest.get("PRIVACY") !== CURRENT_PRIVACY_VERSION
  ) {
    throw redirect({ to: "/legal/accept" })
  }
}

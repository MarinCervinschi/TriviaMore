import { createServerFn } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "./versions"

/**
 * Guard that ensures the current user has accepted the latest
 * versions of Terms and Privacy Policy. Must run after requireAuth:
 * if there is no user, it silently returns (the wrapping auth guard
 * will have already redirected). If the user has not accepted the
 * current versions, it redirects to /legal/accept.
 */
export const requireLegalAcceptance = createServerFn({
  method: "GET",
}).handler(async (): Promise<void> => {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: rows } = await supabase
    .from("legal_acceptances")
    .select("document_type, version, accepted_at")
    .eq("user_id", user.id)
    .order("accepted_at", { ascending: false })

  const latestByType = new Map<string, string>()
  for (const row of rows ?? []) {
    if (!latestByType.has(row.document_type)) {
      latestByType.set(row.document_type, row.version)
    }
  }

  const termsOk = latestByType.get("TERMS") === CURRENT_TERMS_VERSION
  const privacyOk = latestByType.get("PRIVACY") === CURRENT_PRIVACY_VERSION

  if (!termsOk || !privacyOk) {
    throw redirect({ to: "/legal/accept" })
  }
})

import { createServerFn } from "@tanstack/react-start"
import {
  getRequestHeader,
  getRequestIP,
} from "@tanstack/react-start/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

import { acceptLegalSchema } from "./schemas"
import type { LegalAcceptance, LegalAcceptanceStatus } from "./types"
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "./versions"

/**
 * Returns the latest accepted version for each document type for the
 * current user, or `null` entries when the user has never accepted.
 */
export const getAcceptanceStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<LegalAcceptanceStatus | null> => {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

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

    const acceptedTermsVersion = latestByType.get("TERMS") ?? null
    const acceptedPrivacyVersion = latestByType.get("PRIVACY") ?? null

    return {
      acceptedTermsVersion,
      acceptedPrivacyVersion,
      hasAcceptedTerms: acceptedTermsVersion === CURRENT_TERMS_VERSION,
      hasAcceptedPrivacy: acceptedPrivacyVersion === CURRENT_PRIVACY_VERSION,
    }
  },
)

/**
 * Records acceptance of Terms and Privacy for the currently-authenticated
 * user, capturing IP and user-agent from the incoming request headers.
 * Writes via the service-role client so RLS policies do not block the
 * insert.
 */
export const recordLegalAcceptanceFn = createServerFn({ method: "POST" })
  .inputValidator(acceptLegalSchema)
  .handler(async (): Promise<{ success: boolean; error?: string }> => {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Utente non autenticato" }
    }

    const admin = getSupabaseAdmin()

    let ipAddress: string | null = null
    let userAgent: string | null = null
    try {
      userAgent = getRequestHeader("user-agent") ?? null
      ipAddress = getRequestIP({ xForwardedFor: true }) ?? null
    } catch {
      // Request helpers are unavailable outside a request context; leave null
    }

    const { error } = await admin.from("legal_acceptances").insert([
      {
        user_id: user.id,
        document_type: "TERMS",
        version: CURRENT_TERMS_VERSION,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
      {
        user_id: user.id,
        document_type: "PRIVACY",
        version: CURRENT_PRIVACY_VERSION,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    ])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  })

/**
 * Admin-only: returns the full acceptance history for a given user.
 * Used by future audit tooling. RLS on legal_acceptances already
 * restricts non-admin callers.
 */
export const getAcceptanceHistoryFn = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()

    const { data: rows } = await supabase
      .from("legal_acceptances")
      .select("*")
      .eq("user_id", data.userId)
      .order("accepted_at", { ascending: false })

    return (rows ?? []).map((r) => ({
      ...r,
      ip_address: typeof r.ip_address === "string" ? r.ip_address : null,
    })) satisfies LegalAcceptance[]
  })

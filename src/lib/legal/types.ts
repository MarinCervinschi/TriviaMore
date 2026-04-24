import type { Tables, Enums } from "@/lib/supabase/database.types"

export type LegalDocumentType = Enums<"legal_document_type">

/**
 * Row type coerced for serialization across the server-fn boundary.
 * The underlying Postgres INET column is typed as `unknown` by the
 * generated client; we narrow it to a string so TanStack Start can
 * serialize the response.
 */
export type LegalAcceptance = Omit<Tables<"legal_acceptances">, "ip_address"> & {
  ip_address: string | null
}

export type LegalAcceptanceStatus = {
  hasAcceptedTerms: boolean
  hasAcceptedPrivacy: boolean
  acceptedTermsVersion: string | null
  acceptedPrivacyVersion: string | null
}

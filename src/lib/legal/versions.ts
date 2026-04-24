/**
 * Current published versions of each legal document.
 *
 * Bump the version string whenever the content of a document changes
 * in a material way. The consent guard compares these values against
 * each user's most recent acceptance row; any mismatch forces the
 * user to re-accept on their next authenticated request.
 *
 * Use an ISO-style date string to keep versions sortable and
 * human-readable.
 */

export const CURRENT_TERMS_VERSION = "2026-04-24"
export const CURRENT_PRIVACY_VERSION = "2026-04-24"
export const CURRENT_COOKIE_POLICY_VERSION = "2026-04-24"

/**
 * Short user-facing summary of what changed in each version. Shown on
 * the /legal/accept page so users know why they are being asked to
 * re-accept. When bumping a version above, add a new entry here
 * describing the material changes in a couple of bullet points.
 */
export const LEGAL_VERSION_NOTES: Record<
  string,
  { title: string; changes: string[] }
> = {
  "2026-04-24": {
    title: "Prima pubblicazione dei documenti legali",
    changes: [
      "Pubblicati per la prima volta i Termini e Condizioni di utilizzo.",
      "Pubblicata l'Informativa sulla Privacy ai sensi del GDPR.",
      "Introdotto il banner di consenso ai cookie per gli strumenti di analisi.",
    ],
  },
}

export function getCurrentLegalNotes() {
  return (
    LEGAL_VERSION_NOTES[CURRENT_TERMS_VERSION] ??
    LEGAL_VERSION_NOTES[CURRENT_PRIVACY_VERSION] ?? {
      title: "Documenti legali aggiornati",
      changes: [
        "I Termini e Condizioni e/o l'Informativa sulla Privacy sono stati aggiornati.",
      ],
    }
  )
}

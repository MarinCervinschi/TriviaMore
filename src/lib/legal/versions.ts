/** Bump on any material change; a mismatch with a user's latest acceptance forces re-acceptance. */

export const CURRENT_TERMS_VERSION = "2026-04-24";
export const CURRENT_PRIVACY_VERSION = "2026-04-24";
export const CURRENT_COOKIE_POLICY_VERSION = "2026-04-24";

/** Shown on /legal/accept; add an entry when bumping a version. */
export const LEGAL_VERSION_NOTES: Record<string, { title: string; changes: string[] }> =
	{
		"2026-04-24": {
			title: "Prima pubblicazione dei documenti legali",
			changes: [
				"Pubblicati per la prima volta i Termini e Condizioni di utilizzo.",
				"Pubblicata l'Informativa sulla Privacy ai sensi del GDPR.",
				"Introdotto il banner di consenso ai cookie per gli strumenti di analisi.",
			],
		},
	};

export function getCurrentLegalNotes() {
	return (
		LEGAL_VERSION_NOTES[CURRENT_TERMS_VERSION] ??
		LEGAL_VERSION_NOTES[CURRENT_PRIVACY_VERSION] ?? {
			title: "Documenti legali aggiornati",
			changes: [
				"I Termini e Condizioni e/o l'Informativa sulla Privacy sono stati aggiornati.",
			],
		}
	);
}

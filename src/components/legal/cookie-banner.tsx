import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { useCookieConsent } from "@/hooks/useCookieConsent"

/**
 * GDPR-compliant cookie banner. Mounts only in production builds and
 * only when the visitor has not yet expressed a choice. Presents two
 * equally prominent actions (Accetta / Rifiuta) with no close button,
 * as required by the Garante guidelines of 10 June 2021.
 */
export function CookieBanner() {
  const { consent, accept, reject } = useCookieConsent()

  if (!import.meta.env.PROD) return null
  if (consent !== "unknown") return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-md sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-1">
          <p
            id="cookie-banner-title"
            className="text-sm font-semibold"
          >
            Rispettiamo la tua privacy
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Utilizziamo cookie tecnici necessari al funzionamento del sito
            e, previo consenso, cookie analitici per migliorare l'esperienza.{" "}
            <Link
              to="/legal/cookies"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Leggi la Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reject}
            className="min-w-[96px]"
          >
            Rifiuta
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={accept}
            className="min-w-[96px]"
          >
            Accetta
          </Button>
        </div>
      </div>
    </div>
  )
}

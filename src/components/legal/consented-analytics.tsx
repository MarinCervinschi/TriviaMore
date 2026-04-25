import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import { useCookieConsent } from "@/hooks/useCookieConsent"

/**
 * Renders the Vercel analytics components only in production builds
 * and only after the visitor has accepted analytics cookies. In dev
 * builds both gates short-circuit to null to keep the analytics
 * network calls and the banner out of the development experience.
 */
export function ConsentedAnalytics() {
  const { consent } = useCookieConsent()

  if (!import.meta.env.PROD) return null
  if (consent !== "accepted") return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

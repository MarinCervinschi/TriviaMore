import { useEffect, useState } from "react"

export const COOKIE_CONSENT_NAME = "tm-cookie-consent"

export type CookieConsent = "accepted" | "rejected" | "unknown"

function readConsentFromDocument(): CookieConsent {
  if (typeof document === "undefined") return "unknown"
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_CONSENT_NAME}=`))
  if (!match) return "unknown"
  const value = match.split("=")[1]
  return value === "accepted" || value === "rejected" ? value : "unknown"
}

function writeConsent(value: "accepted" | "rejected") {
  if (typeof document === "undefined") return
  const oneYear = 60 * 60 * 24 * 365
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:"
  document.cookie = [
    `${COOKIE_CONSENT_NAME}=${value}`,
    "path=/",
    `max-age=${oneYear}`,
    "SameSite=Lax",
    isSecure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
  window.dispatchEvent(new CustomEvent("tm:cookie-consent-changed"))
}

function clearConsent() {
  if (typeof document === "undefined") return
  document.cookie = `${COOKIE_CONSENT_NAME}=; path=/; max-age=0`
  window.dispatchEvent(new CustomEvent("tm:cookie-consent-changed"))
}

/**
 * Reads the cookie-consent state on the client and reacts to programmatic
 * changes from the banner or the footer "Preferenze cookie" button.
 * Returns 'unknown' during SSR and on the initial client render to avoid
 * hydration mismatches.
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>("unknown")

  useEffect(() => {
    setConsent(readConsentFromDocument())
    const onChange = () => setConsent(readConsentFromDocument())
    window.addEventListener("tm:cookie-consent-changed", onChange)
    return () =>
      window.removeEventListener("tm:cookie-consent-changed", onChange)
  }, [])

  return {
    consent,
    accept: () => writeConsent("accepted"),
    reject: () => writeConsent("rejected"),
    reset: () => clearConsent(),
  }
}

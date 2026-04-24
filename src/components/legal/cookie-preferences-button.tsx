import { useCookieConsent } from "@/hooks/useCookieConsent"

/**
 * Footer-mounted button that clears the cookie-consent cookie and
 * reopens the banner so the user can change their mind. Hidden in
 * development builds, where the banner itself is disabled.
 */
export function CookiePreferencesButton() {
  const { reset } = useCookieConsent()

  if (!import.meta.env.PROD) return null

  return (
    <button
      type="button"
      onClick={reset}
      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
    >
      Preferenze cookie
    </button>
  )
}

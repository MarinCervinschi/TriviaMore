import { Link } from "@tanstack/react-router"

import { CookiePreferencesButton } from "@/components/legal/cookie-preferences-button"
import { Logo } from "@/components/ui/logo"

const footerLinks = [
  {
    href: "https://github.com/MarinCervinschi/TriviaMore",
    label: "GitHub",
    external: true,
  },
  { href: "/about", label: "Chi siamo", external: false },
  { href: "/contact", label: "Contattaci", external: false },
  { href: "/legal/terms", label: "Termini", external: false },
  { href: "/legal/privacy", label: "Privacy", external: false },
  { href: "/legal/cookies", label: "Cookie", external: false },
]

function DotSeparator() {
  return (
    <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/30 sm:block" />
  )
}

export function MinimalFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border/50">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/40" />
        <div className="absolute -left-20 bottom-0 h-[200px] w-[200px] rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute right-0 bottom-0 h-[150px] w-[150px] rounded-full bg-orange-300/5 blur-[60px]" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      <div className="container py-10 sm:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <Link to="/" className="transition-transform hover:scale-105">
              <Logo size="sm" />
            </Link>
            <p className="text-xs text-muted-foreground/60">
              Preparati agli esami con la community
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-2">
            {footerLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-2 sm:gap-2">
                {i > 0 && <DotSeparator />}
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            ))}
            {import.meta.env.PROD && (
              <span className="flex items-center gap-2 sm:gap-2">
                <DotSeparator />
                <CookiePreferencesButton />
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} TriviaMore
          </p>
        </div>
      </div>
    </footer>
  )
}

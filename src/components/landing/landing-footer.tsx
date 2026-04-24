import { Link } from "@tanstack/react-router"
import { Github } from "lucide-react"

import { CookiePreferencesButton } from "@/components/legal/cookie-preferences-button"
import { Logo } from "@/components/ui/logo"

import type { FooterSection } from "./data"

export function LandingFooter({ sections }: { sections: FooterSection[] }) {
  return (
    <footer className="relative border-t">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 to-muted/60" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="mb-4 inline-block">
              <Logo size="md" />
            </Link>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              La piattaforma open source creata da studenti per studenti.
              Preparati agli esami universitari con la community.
            </p>
            <a
              href="https://github.com/MarinCervinschi/TriviaMore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground/60 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} TriviaMore. Progetto open source
            per la community studentesca.
          </p>
          <div className="flex items-center gap-4">
            {import.meta.env.PROD && <CookiePreferencesButton />}
            <p>Fatto con cura a Modena</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

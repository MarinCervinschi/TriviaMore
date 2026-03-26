import { Link } from "@tanstack/react-router"

import { LogoIcon } from "@/components/ui/logo"

import type { FooterSection } from "./data"

export function LandingFooter({ sections }: { sections: FooterSection[] }) {
  return (
    <footer className="border-t bg-muted/40 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <LogoIcon size={24} />
              <span className="text-xl font-bold">Trivia More</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La piattaforma open source creata da studenti per studenti.
              Preparati agli esami universitari con la community.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 font-semibold">{section.title}</h4>
              <ul className="space-y-2 text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        className="transition-colors duration-200 hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="transition-colors duration-200 hover:text-foreground">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground/70">
          <p>
            &copy; {new Date().getFullYear()} Trivia More. Progetto open source
            per la community studentesca.
          </p>
        </div>
      </div>
    </footer>
  )
}

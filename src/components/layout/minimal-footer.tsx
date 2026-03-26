import { Link } from "@tanstack/react-router"

import { LogoIcon } from "@/components/ui/logo"

const footerLinks = [
  {
    href: "https://github.com/MarinCervinschi/TriviaMore",
    label: "GitHub",
    external: true,
  },
  { href: "/about", label: "Chi siamo", external: false },
  { href: "/contact", label: "Contattaci", external: false },
]

function DotSeparator() {
  return (
    <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/30 sm:block" />
  )
}

export function MinimalFooter() {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-transparent to-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <LogoIcon size={20} />
            <span className="text-lg font-bold gradient-text">TriviaMore</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-2">
            {footerLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-2 sm:gap-2">
                {i > 0 && <DotSeparator />}
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
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
              </span>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} TriviaMore
          </p>
        </div>
      </div>
    </footer>
  )
}

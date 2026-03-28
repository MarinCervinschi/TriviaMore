import { Link } from "@tanstack/react-router"

import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "../theme-toggle"
import { useNavLinks } from "./nav-links"
import { AuthSection } from "./user-menu"
import { MobileMenu } from "./mobile-menu"

function NavLogo() {
  return (
    <Link
      to="/"
      className="transition-transform hover:scale-105"
    >
      <Logo size="md" />
    </Link>
  )
}

export function Navbar() {
  const navLinks = useNavLinks()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center">
        <NavLogo />

        {/* Desktop nav — pill style, no icons */}
        <nav className="ml-8 hidden md:flex md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className:
                  "bg-primary/10 text-primary font-semibold hover:text-primary",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <ThemeToggle />
            <AuthSection />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

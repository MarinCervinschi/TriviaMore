import { Link } from "@tanstack/react-router"
import { ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "../theme-toggle"
import { useNavItems } from "./nav-links"
import type { NavItem } from "./nav-links"
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

function DesktopNavItem({ item }: { item: NavItem }) {
  if (item.type === "link") {
    return (
      <Link
        to={item.to}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        activeProps={{
          className:
            "bg-primary/10 text-primary font-semibold hover:text-primary",
        }}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none">
        {item.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8}>
        {item.children.map((child) => (
          <DropdownMenuItem key={child.to} asChild>
            <Link to={child.to} className="flex items-center gap-2">
              {child.icon && <child.icon className="h-4 w-4" strokeWidth={1.5} />}
              {child.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const navItems = useNavItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center">
        <NavLogo />

        {/* Desktop nav */}
        <nav className="ml-8 hidden md:flex md:gap-1">
          {navItems.map((item, i) => (
            <DesktopNavItem key={item.type === "link" ? item.to : `dropdown-${i}`} item={item} />
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

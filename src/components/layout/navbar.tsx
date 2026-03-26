import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  BookOpen,
  GraduationCap,
  Home,
  Info,
  LogOut,
  Mail,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import type { LucideIcon } from "lucide-react"

type NavLink = { to: string; label: string; icon?: LucideIcon }

const GUEST_NAV_LINKS: NavLink[] = [
  { to: "/browse", label: "Contenuti", icon: BookOpen },
  { to: "/about", label: "Chi Siamo", icon: Info },
  { to: "/contact", label: "Contatti", icon: Mail },
]

const AUTH_NAV_LINKS: NavLink[] = [
  { to: "/user", label: "Il Mio Profilo", icon: Home },
  { to: "/browse", label: "Contenuti", icon: BookOpen },
  { to: "/user/classes", label: "I Miei Corsi", icon: GraduationCap },
]

const ADMIN_NAV_LINK: NavLink = {
  to: "/admin",
  label: "Gestione",
  icon: Shield,
}

const USER_MENU_LINKS: NavLink[] = [
  { to: "/user", label: "Il Mio Profilo", icon: User },
  { to: "/contact", label: "Contatti", icon: Mail },
  { to: "/user/settings", label: "Impostazioni", icon: Settings },
]

function NavLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-lg">
      <span className="gradient-text">TriviaMore</span>
    </Link>
  )
}

function ThemeToggle() {
  const { mounted, isDark, toggleTheme } = useTheme()

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" disabled />
  }

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Cambia tema</span>
    </Button>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "Utente"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user?.name ?? "Utente"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {USER_MENU_LINKS.map((link) => (
          <DropdownMenuItem key={link.to} asChild>
            <Link to={link.to}>
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate({})}>
          <LogOut className="mr-2 h-4 w-4" />
          Esci
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AuthSection() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <Skeleton className="h-9 w-20" />
  }

  if (isAuthenticated) {
    return <UserMenu />
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/auth/login">Accedi</Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="/auth/register">Registrati</Link>
      </Button>
    </div>
  )
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { isLoading, isAuthenticated, user, logout } = useAuth()
  const navLinks = useNavLinks()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="gradient-text text-left">TriviaMore</SheetTitle>
        </SheetHeader>

        {/* User info for authenticated */}
        {isAuthenticated && user && (
          <>
            <div className="mt-4 flex items-center gap-3 border-b px-3 pb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Utente"} />
                <AvatarFallback>
                  {user.name
                    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : user.email?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user.name ?? "Utente"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </>
        )}

        <nav className="mt-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              activeProps={{ className: "bg-accent text-primary font-semibold" }}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>
        <Separator className="my-4" />
        <div className="flex items-center justify-between px-3">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <Separator className="my-4" />
        {isLoading ? (
          <Skeleton className="mx-3 h-9" />
        ) : isAuthenticated ? (
          <div className="flex flex-col gap-1">
            {USER_MENU_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            <Separator className="my-2" />
            <button
              onClick={() => {
                logout.mutate({})
                setOpen(false)
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-3">
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/auth/login">Accedi</Link>
            </Button>
            <Button variant="outline" asChild onClick={() => setOpen(false)}>
              <Link to="/auth/register">Registrati</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function useNavLinks() {
  const { isAuthenticated, user } = useAuth()
  const isAdmin =
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MAINTAINER"

  if (!isAuthenticated) return GUEST_NAV_LINKS
  if (isAdmin) return [...AUTH_NAV_LINKS, ADMIN_NAV_LINK]
  return AUTH_NAV_LINKS
}

export function Navbar() {
  const navLinks = useNavLinks()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <NavLogo />
        <nav className="ml-6 hidden md:flex md:gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
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

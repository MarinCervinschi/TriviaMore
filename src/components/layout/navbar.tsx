import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Menu, Moon, Sun, LogOut, LayoutDashboard, Settings } from "lucide-react"

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

const NAV_LINKS = [
  { to: "/browse", label: "Esplora" },
  { to: "/about", label: "Chi siamo" },
  { to: "/contact", label: "Contatti" },
] as const

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
        <DropdownMenuItem asChild>
          <Link to="/user">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/user/settings">
            <Settings className="mr-2 h-4 w-4" />
            Impostazioni
          </Link>
        </DropdownMenuItem>
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
        <nav className="mt-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              activeProps={{ className: "bg-accent text-primary font-semibold" }}
            >
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
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.name ?? "Utente"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Link
              to="/user"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Dashboard
            </Link>
            <Link
              to="/user/settings"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Impostazioni
            </Link>
            <Separator className="my-2" />
            <button
              onClick={() => {
                logout.mutate({})
                setOpen(false)
              }}
              className="rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-accent text-left"
            >
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

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <NavLogo />
        <nav className="ml-6 hidden md:flex md:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
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

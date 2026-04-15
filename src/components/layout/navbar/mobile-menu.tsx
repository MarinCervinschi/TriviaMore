import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { LogOut, Menu } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "../theme-toggle"
import { useNavItems, USER_MENU_LINKS } from "./nav-links"
import type { NavItem } from "./nav-links"

function MobileNavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  if (item.type === "link") {
    return (
      <Link
        to={item.to}
        onClick={onClose}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        activeProps={{
          className: "bg-primary/10 text-primary font-semibold",
        }}
      >
        {item.icon && <item.icon className="h-4 w-4" strokeWidth={1.5} />}
        {item.label}
      </Link>
    )
  }

  // Dropdown: main link + children indented
  return (
    <>
      {item.to ? (
        <Link
          to={item.to}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          activeProps={{
            className: "bg-primary/10 text-primary font-semibold",
          }}
        >
          {item.icon && <item.icon className="h-4 w-4" strokeWidth={1.5} />}
          {item.label}
        </Link>
      ) : (
        <p className="mt-2 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {item.label}
        </p>
      )}
      {item.children.map((child) => (
        <Link
          key={child.to}
          to={child.to}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 pl-6 text-sm font-medium transition-colors hover:bg-accent"
          activeProps={{
            className: "bg-primary/10 text-primary font-semibold",
          }}
        >
          {child.icon && <child.icon className="h-4 w-4" strokeWidth={1.5} />}
          {child.label}
        </Link>
      ))}
    </>
  )
}

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { isLoading, isAuthenticated, user, logout } = useAuth()
  const navItems = useNavItems()

  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 backdrop-blur-xl bg-background/95">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Logo size="sm" />
          </SheetTitle>
        </SheetHeader>

        {isAuthenticated && user && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? "Utente"}
              />
              <AvatarFallback className="text-xs font-semibold">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : user.email?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-medium">{user.name ?? "Utente"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item, i) => (
            <MobileNavItem
              key={item.type === "link" ? item.to : `dropdown-${i}`}
              item={item}
              onClose={close}
            />
          ))}
        </nav>

        <Separator className="my-4" />

        <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>

        <Separator className="my-4" />

        {isLoading ? (
          <Skeleton className="mx-3 h-10 rounded-xl" />
        ) : isAuthenticated ? (
          <div className="flex flex-col gap-1">
            {USER_MENU_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                {link.icon && (
                  <link.icon className="h-4 w-4" strokeWidth={1.5} />
                )}
                {link.label}
              </Link>
            ))}
            <Separator className="my-2" />
            <button
              onClick={() => {
                logout.mutate({})
                close()
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Esci
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <Button asChild onClick={close}>
              <Link to="/auth/login">Accedi</Link>
            </Button>
            <Button variant="outline" asChild onClick={close}>
              <Link to="/auth/register">Registrati</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

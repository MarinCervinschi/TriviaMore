import { useRef, useState } from "react"
import { Link, useMatchRoute } from "@tanstack/react-router"
import {
  BookOpen,
  Cookie,
  GraduationCap,
  LogOut,
  Mail,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useCookieConsent } from "@/hooks/useCookieConsent"
import { useTheme } from "@/hooks/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LogoIcon } from "@/components/ui/logo"
import { SidebarChangelogMegaphone } from "@/components/notifications/changelog-megaphone"
import { SidebarNotificationBell } from "@/components/notifications/notification-bell"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ABOUT_ITEM,
  ADMIN_ITEM,
  NAV_ITEMS,
  getInitials,
  useIsAdmin,
  type NavItem,
} from "./nav-items"

const ITEM_BASE =
  "relative flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const ITEM_IDLE =
  "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
const ITEM_ACTIVE = "text-primary"

function ActiveBar() {
  return (
    <span className="absolute -left-[14px] bottom-2 top-2 w-[3px] rounded-r-full bg-primary" />
  )
}

function SidebarNavIcon({
  item,
  isActive,
}: {
  item: NavItem
  isActive: boolean
}) {
  const Icon = item.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.to}
          aria-current={isActive ? "page" : undefined}
          className={cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE)}
        >
          {isActive && <ActiveBar />}
          <Icon className="size-[18px]" strokeWidth={1.5} />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={14}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarThemeToggle() {
  const { mounted, isDark, toggleTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          disabled={!mounted}
          aria-label="Cambia tema"
          className={cn(ITEM_BASE, ITEM_IDLE)}
        >
          {mounted && isDark ? (
            <Sun className="size-[18px]" strokeWidth={1.5} />
          ) : (
            <Moon className="size-[18px]" strokeWidth={1.5} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={14}>
        Cambia tema
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarSearchHover() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpen(true)
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Cerca"
            className={cn(ITEM_BASE, ITEM_IDLE)}
          >
            <Search className="size-[18px]" strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        {!open && (
          <TooltipContent side="right" sideOffset={14}>
            Cerca
          </TooltipContent>
        )}
      </Tooltip>

      {open && (
        <div
          className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 slide-in-from-left-2 duration-150">
            <Link
              to="/search/courses"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <GraduationCap className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              Cerca Corso
            </Link>
            <Link
              to="/search/classes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              Cerca Insegnamento
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarProfile({
  user,
  onLogout,
}: {
  user: ReturnType<typeof useAuth>["user"]
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const initials = getInitials(user?.name, user?.email)
  const { reset: resetCookieConsent } = useCookieConsent()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              aria-label="Menu profilo"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image ?? undefined}
                  alt={user?.name ?? "Utente"}
                />
                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14}>
          Profilo
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="right"
        sideOffset={16}
        align="end"
        className="w-64 p-0"
      >
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name ?? "Utente"}
            />
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? "Utente"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col py-1">
          <Link
            to="/user/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
            Impostazioni
          </Link>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            Contatti
          </Link>
          {import.meta.env.PROD && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                resetCookieConsent()
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent"
            >
              <Cookie className="h-4 w-4" strokeWidth={1.5} />
              Preferenze cookie
            </button>
          )}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-xs text-muted-foreground">
          <Link
            to="/legal/terms"
            onClick={() => setOpen(false)}
            className="transition-colors hover:text-foreground"
          >
            Termini
          </Link>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <Link
            to="/legal/privacy"
            onClick={() => setOpen(false)}
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <Link
            to="/legal/cookies"
            onClick={() => setOpen(false)}
            className="transition-colors hover:text-foreground"
          >
            Cookie
          </Link>
        </div>

        <Separator />

        <div className="p-1">
          <button
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Esci
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function GroupDivider() {
  return <Separator className="my-1 w-[30px] bg-border" />
}

export function LumaSidebar() {
  const isAdmin = useIsAdmin()
  const matchRoute = useMatchRoute()
  const { user, logout } = useAuth()

  const adminActive = isAdmin && !!matchRoute({ to: ADMIN_ITEM.to, fuzzy: ADMIN_ITEM.fuzzy })

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        role="navigation"
        aria-label="Navigazione principale"
        className={cn(
          "fixed bottom-3 left-3 top-3 z-50 w-[66px]",
          "hidden flex-col items-center gap-[7px] py-3 md:flex",
          // Floating card: subtle translucent bg so the shared app decor
          // still bleeds through, border + shadow define the container
          "rounded-2xl border border-border/60 bg-background/40 backdrop-blur-sm",
          "shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
        )}
      >
        {/* Brand */}
        <Link
          to="/user"
          aria-label="TriviaMore home"
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoIcon size={26} />
        </Link>

        <GroupDivider />

        {/* Primary nav */}
        {NAV_ITEMS.map((item) => (
          <SidebarNavIcon
            key={item.to}
            item={item}
            isActive={!!matchRoute({ to: item.to, fuzzy: item.fuzzy })}
          />
        ))}

        <GroupDivider />

        {/* Tools */}
        <SidebarSearchHover />
        <SidebarNavIcon
          item={ABOUT_ITEM}
          isActive={!!matchRoute({ to: ABOUT_ITEM.to, fuzzy: ABOUT_ITEM.fuzzy })}
        />
        {isAdmin && <SidebarNavIcon item={ADMIN_ITEM} isActive={adminActive} />}

        <div className="flex-1" />
        <GroupDivider />

        {/* Utility */}
        <SidebarChangelogMegaphone />
        <SidebarNotificationBell />
        <SidebarThemeToggle />
        <SidebarProfile user={user} onLogout={() => logout.mutate({})} />
      </aside>
    </TooltipProvider>
  )
}

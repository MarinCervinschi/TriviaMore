import { useRef, useState, useEffect, useCallback } from "react"
import { Link, useMatchRoute } from "@tanstack/react-router"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  Bookmark,
  BookOpen,
  GraduationCap,
  Home,
  Inbox,
  LogOut,
  Mail,
  Moon,
  Settings,
  Shield,
  Sun,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DockNotificationBell } from "@/components/notifications/notification-bell"
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

import type { LucideIcon } from "lucide-react"
import type { MotionValue } from "framer-motion"

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  fuzzy: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: "/user", icon: Home, label: "Dashboard", fuzzy: false },
  { to: "/browse", icon: BookOpen, label: "Contenuti", fuzzy: true },
  { to: "/user/classes", icon: GraduationCap, label: "I Miei Corsi", fuzzy: false },
  { to: "/user/requests", icon: Inbox, label: "Contributi", fuzzy: true },
  { to: "/user/bookmarks", icon: Bookmark, label: "Segnalibri", fuzzy: false },
]

const ADMIN_ITEM: NavItem = {
  to: "/admin",
  icon: Shield,
  label: "Gestione",
  fuzzy: true,
}

// Dock magnification config
const ICON_SIZE = 40
const MAGNIFIED_SIZE = 56
const DISTANCE = 120
const SPRING_CONFIG = { mass: 0.1, stiffness: 200, damping: 18 }

function useNavItems() {
  const { user } = useAuth()
  const isAdmin =
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MAINTAINER"

  if (isAdmin) return [...NAV_ITEMS, ADMIN_ITEM]
  return NAV_ITEMS
}

function getInitials(name: string | null | undefined, email: string | undefined) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email?.[0]?.toUpperCase() ?? "?"
}

function useDockMagnification(
  ref: React.RefObject<HTMLElement | null>,
  mouseX: MotionValue<number>,
  prefersReduced: boolean,
) {
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distance,
    [-DISTANCE, 0, DISTANCE],
    [ICON_SIZE, MAGNIFIED_SIZE, ICON_SIZE],
  )
  const width = useSpring(widthSync, SPRING_CONFIG)

  const scaleSync = useTransform(width, [ICON_SIZE, MAGNIFIED_SIZE], [1, 1.2])
  const scale = useSpring(scaleSync, SPRING_CONFIG)

  if (prefersReduced) {
    return { width: ICON_SIZE, scale: 1 }
  }

  return { width, scale }
}

function DockIcon({
  item,
  isActive,
  mouseX,
  prefersReduced,
}: {
  item: NavItem
  isActive: boolean
  mouseX: MotionValue<number>
  prefersReduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { width, scale } = useDockMagnification(ref, mouseX, prefersReduced)
  const Icon = item.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={ref}
          style={{ width }}
          className="relative aspect-square"
        >
          {/* Active glow — renders behind the icon, scales with item */}
          {isActive && (
            <motion.div
              layoutId="luma-active-glow"
              className="absolute inset-0 rounded-full bg-primary/15 shadow-[0_0_16px_hsl(var(--ring)/0.25)]"
              transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Link
            to={item.to}
            className={cn(
              "relative z-10 flex h-full w-full items-center justify-center rounded-full",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <motion.div
              className="flex items-center justify-center"
              style={{ scale }}
            >
              <Icon className="size-5" strokeWidth={1.5} />
            </motion.div>
          </Link>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={12}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

function DockThemeToggle({
  mouseX,
  prefersReduced,
}: {
  mouseX: MotionValue<number>
  prefersReduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { width, scale } = useDockMagnification(ref, mouseX, prefersReduced)
  const { mounted, isDark, toggleTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={ref}
          style={{ width }}
          className="aspect-square"
        >
          <button
            className="relative z-10 flex h-full w-full items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            onClick={toggleTheme}
            disabled={!mounted}
            aria-label="Cambia tema"
          >
            <motion.div
              className="flex items-center justify-center"
              style={{ scale }}
            >
              {mounted && isDark ? (
                <Sun className="size-5" strokeWidth={1.5} />
              ) : (
                <Moon className="size-5" strokeWidth={1.5} />
              )}
            </motion.div>
          </button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={12}>
        Cambia tema
      </TooltipContent>
    </Tooltip>
  )
}

function DockProfileIcon({
  user,
  mouseX,
  prefersReduced,
  onLogout,
}: {
  user: ReturnType<typeof useAuth>["user"]
  mouseX: MotionValue<number>
  prefersReduced: boolean
  onLogout: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { width, scale } = useDockMagnification(ref, mouseX, prefersReduced)
  const initials = getInitials(user?.name, user?.email)

  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <motion.div
              ref={ref}
              style={{ width }}
              className="aspect-square"
            >
              <button
                className="relative z-10 flex h-full w-full items-center justify-center rounded-full transition-colors hover:bg-accent/50"
                aria-label="Menu profilo"
              >
                <motion.div
                  className="flex items-center justify-center"
                  style={{ scale }}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user?.image ?? undefined}
                      alt={user?.name ?? "Utente"}
                    />
                    <AvatarFallback className="text-[10px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </button>
            </motion.div>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={12}>
          Profilo
        </TooltipContent>
      </Tooltip>

      <PopoverContent side="top" sideOffset={16} align="end" className="w-64 p-0">
        {/* User info */}
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

        {/* Links */}
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
        </div>

        <Separator />

        {/* Logout */}
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

function useHideAtBottom(offset = 80) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  const check = useCallback(() => {
    const currentY = window.scrollY
    const scrollingDown = currentY > lastScrollY.current
    lastScrollY.current = currentY

    const scrollBottom = window.innerHeight + currentY
    const atBottom = scrollBottom >= document.documentElement.scrollHeight - offset

    // Only hide when actively scrolling down AND at the bottom
    setHidden(scrollingDown && atBottom)
  }, [offset])

  useEffect(() => {
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [check])

  return hidden
}

export function LumaBar() {
  const items = useNavItems()
  const matchRoute = useMatchRoute()
  const prefersReduced = useReducedMotion()
  const { user, logout } = useAuth()
  const hidden = useHideAtBottom()

  const mouseX = useMotionValue(Infinity)

  const activeIndex = items.findIndex((item) =>
    matchRoute({ to: item.to, fuzzy: item.fuzzy }),
  )

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      animate={{ y: hidden ? 100 : 0, opacity: hidden ? 0 : 1 }}
      transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
    >
      <TooltipProvider delayDuration={300}>
        <motion.nav
          className="flex items-end gap-2 rounded-full border border-border/50 bg-background/20 px-2 pb-2 pt-2 shadow-xl backdrop-blur-2xl dark:bg-background/30"
          role="navigation"
          aria-label="Navigazione principale"
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
        >
          {/* Nav items */}
          {items.map((item, index) => (
            <DockIcon
              key={item.to}
              item={item}
              isActive={index === activeIndex}
              mouseX={mouseX}
              prefersReduced={prefersReduced}
            />
          ))}

          {/* Separator dot */}
          <div className="mx-0.5 mb-1 h-1 w-1 self-center rounded-full bg-border" />

          {/* Notification bell */}
          <DockNotificationBell mouseX={mouseX} prefersReduced={prefersReduced} />

          {/* Theme toggle */}
          <DockThemeToggle mouseX={mouseX} prefersReduced={prefersReduced} />

          {/* Profile popover */}
          <DockProfileIcon
            user={user}
            mouseX={mouseX}
            prefersReduced={prefersReduced}
            onLogout={() => logout.mutate({})}
          />
        </motion.nav>
      </TooltipProvider>
    </motion.div>
  )
}

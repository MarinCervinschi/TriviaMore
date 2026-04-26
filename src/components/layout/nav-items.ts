import {
  Compass,
  GraduationCap,
  Home,
  Inbox,
  Info,
  Shield,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

import type { LucideIcon } from "lucide-react"

export interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  fuzzy: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/user", icon: Home, label: "Dashboard", fuzzy: false },
  { to: "/browse", icon: Compass, label: "Esplora", fuzzy: false },
  { to: "/user/classes", icon: GraduationCap, label: "I Miei Corsi", fuzzy: false },
  { to: "/user/requests", icon: Inbox, label: "Contributi", fuzzy: true },
]

export const ABOUT_ITEM: NavItem = {
  to: "/about",
  icon: Info,
  label: "Chi siamo",
  fuzzy: false,
}

export const ADMIN_ITEM: NavItem = {
  to: "/admin",
  icon: Shield,
  label: "Gestione",
  fuzzy: true,
}

export function useIsAdmin() {
  const { user } = useAuth()
  return (
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MAINTAINER"
  )
}

export function getInitials(
  name: string | null | undefined,
  email: string | undefined,
) {
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

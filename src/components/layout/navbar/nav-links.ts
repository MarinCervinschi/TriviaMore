import {
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  Info,
  Mail,
  Megaphone,
  Settings,
  Shield,
  User,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import type { LucideIcon } from "lucide-react"

export type NavLinkItem = { type: "link"; to: string; label: string; icon?: LucideIcon }
export type NavDropdownItem = {
  type: "dropdown"
  label: string
  to?: string
  icon?: LucideIcon
  children: { to: string; label: string; icon?: LucideIcon; description?: string }[]
}
export type NavItem = NavLinkItem | NavDropdownItem

const EXPLORE_DROPDOWN: NavDropdownItem = {
  type: "dropdown",
  label: "Esplora",
  to: "/browse",
  icon: Compass,
  children: [
    { to: "/search/courses", label: "Cerca Corso", icon: GraduationCap, description: "Trova un corso per nome" },
    { to: "/search/classes", label: "Cerca Insegnamento", icon: BookOpen, description: "Trova un insegnamento per nome" },
  ],
}

export const GUEST_NAV_ITEMS: NavItem[] = [
  EXPLORE_DROPDOWN,
  { type: "link", to: "/about", label: "Chi Siamo", icon: Info },
  { type: "link", to: "/contact", label: "Contatti", icon: Mail },
  { type: "link", to: "/news", label: "Novità", icon: Megaphone },
]

export const AUTH_NAV_ITEMS: NavItem[] = [
  { type: "link", to: "/user", label: "Il Mio Profilo", icon: Home },
  EXPLORE_DROPDOWN,
  { type: "link", to: "/user/classes", label: "I Miei Corsi", icon: GraduationCap },
]

export const ADMIN_NAV_ITEM: NavLinkItem = {
  type: "link",
  to: "/admin",
  label: "Gestione",
  icon: Shield,
}

export const USER_MENU_LINKS: NavLinkItem[] = [
  { type: "link", to: "/user", label: "Il Mio Profilo", icon: User },
  { type: "link", to: "/news", label: "Novità", icon: Megaphone },
  { type: "link", to: "/contact", label: "Contatti", icon: Mail },
  { type: "link", to: "/user/settings", label: "Impostazioni", icon: Settings },
]

export function useNavItems() {
  const { isAuthenticated, user } = useAuth()
  const isAdmin =
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MAINTAINER"

  if (!isAuthenticated) return GUEST_NAV_ITEMS
  if (isAdmin) return [...AUTH_NAV_ITEMS, ADMIN_NAV_ITEM]
  return AUTH_NAV_ITEMS
}

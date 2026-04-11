import {
  BookOpen,
  GraduationCap,
  Home,
  Info,
  Mail,
  Settings,
  Shield,
  User,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import type { LucideIcon } from "lucide-react"

export type NavLink = { to: string; label: string; icon?: LucideIcon }

export const GUEST_NAV_LINKS: NavLink[] = [
  { to: "/departments", label: "Dipartimenti", icon: BookOpen },
  { to: "/about", label: "Chi Siamo", icon: Info },
  { to: "/contact", label: "Contatti", icon: Mail },
]

export const AUTH_NAV_LINKS: NavLink[] = [
  { to: "/user", label: "Il Mio Profilo", icon: Home },
  { to: "/departments", label: "Dipartimenti", icon: BookOpen },
  { to: "/user/classes", label: "I Miei Corsi", icon: GraduationCap },
]

export const ADMIN_NAV_LINK: NavLink = {
  to: "/admin",
  label: "Gestione",
  icon: Shield,
}

export const USER_MENU_LINKS: NavLink[] = [
  { to: "/user", label: "Il Mio Profilo", icon: User },
  { to: "/contact", label: "Contatti", icon: Mail },
  { to: "/user/settings", label: "Impostazioni", icon: Settings },
]

export function useNavLinks() {
  const { isAuthenticated, user } = useAuth()
  const isAdmin =
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MAINTAINER"

  if (!isAuthenticated) return GUEST_NAV_LINKS
  if (isAdmin) return [...AUTH_NAV_LINKS, ADMIN_NAV_LINK]
  return AUTH_NAV_LINKS
}

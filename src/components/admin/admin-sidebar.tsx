import { useQuery } from "@tanstack/react-query"
import { Link, useMatchRoute } from "@tanstack/react-router"
import {
  BookOpen,
  FileQuestion,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  Shield,
  Trophy,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { adminQueries } from "@/lib/admin/queries"

export function AdminSidebar() {
  const { data: stats } = useQuery(adminQueries.stats())
  const { data: userStats } = useQuery(adminQueries.userStats())
  const matchRoute = useMatchRoute()

  const links = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/admin/departments",
      label: "Dipartimenti",
      icon: Library,
      count: stats?.departmentCount,
    },
    {
      to: "/admin/users",
      label: "Utenti",
      icon: Users,
    },
  ]

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Gestione
      </p>
      {links.map((link) => {
        const isActive = matchRoute({ to: link.to, fuzzy: true })
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
              isActive && "bg-accent text-primary",
            )}
          >
            <link.icon className="h-4 w-4" />
            <span className="flex-1">{link.label}</span>
            {link.count !== undefined && (
              <span className="text-xs text-muted-foreground">
                {link.count}
              </span>
            )}
          </Link>
        )
      })}

      <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Contenuti
      </p>
      <SidebarStat icon={GraduationCap} label="Corsi" count={stats?.courseCount} />
      <SidebarStat icon={FolderOpen} label="Classi" count={stats?.classCount} />
      <SidebarStat icon={BookOpen} label="Sezioni" count={stats?.sectionCount} />
      <SidebarStat icon={FileQuestion} label="Domande" count={stats?.questionCount} />

      <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Utenti
      </p>
      <SidebarStat icon={Users} label="Registrati" count={userStats?.totalUsers} />
      <SidebarStat icon={Shield} label="Admin" count={(userStats?.byRole?.SUPERADMIN ?? 0) + (userStats?.byRole?.ADMIN ?? 0) + (userStats?.byRole?.MAINTAINER ?? 0)} />
      <SidebarStat icon={Trophy} label="Quiz completati" count={userStats?.totalQuizAttempts} />
    </nav>
  )
}

function SidebarStat({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType
  label: string
  count?: number
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs">{count}</span>
      )}
    </div>
  )
}

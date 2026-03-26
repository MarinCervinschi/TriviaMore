import { Link } from "@tanstack/react-router"
import type { LinkProps } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

const colorMap: Record<string, { orb: string; badge: string; icon: string }> = {
  blue: { orb: "bg-blue-500/10", badge: "bg-blue-500/10", icon: "text-blue-500" },
  green: { orb: "bg-green-500/10", badge: "bg-green-500/10", icon: "text-green-500" },
  orange: { orb: "bg-orange-500/10", badge: "bg-orange-500/10", icon: "text-orange-500" },
  purple: { orb: "bg-purple-500/10", badge: "bg-purple-500/10", icon: "text-purple-500" },
  red: { orb: "bg-red-500/10", badge: "bg-red-500/10", icon: "text-red-500" },
  yellow: { orb: "bg-yellow-500/10", badge: "bg-yellow-500/10", icon: "text-yellow-500" },
}

type AdminStatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  href?: string
  subtitle?: string
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
  subtitle,
}: AdminStatCardProps) {
  const colors = colorMap[color] ?? colorMap.blue

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full ${colors.orb} blur-[30px]`}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={`shrink-0 rounded-xl ${colors.badge} p-2`}>
            <Icon className={`h-4 w-4 ${colors.icon}`} strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link to={href as LinkProps["to"]}>{content}</Link>
  }

  return content
}

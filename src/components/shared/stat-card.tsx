import { Link } from "@tanstack/react-router"
import type { LinkProps } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const colorMap: Record<string, { orb: string; badge: string; icon: string }> = {
  blue: { orb: "bg-blue-500/10", badge: "bg-blue-500/10", icon: "text-blue-500" },
  green: { orb: "bg-green-500/10", badge: "bg-green-500/10", icon: "text-green-500" },
  orange: {
    orb: "bg-orange-500/10",
    badge: "bg-orange-500/10",
    icon: "text-orange-500",
  },
  purple: {
    orb: "bg-purple-500/10",
    badge: "bg-purple-500/10",
    icon: "text-purple-500",
  },
  red: { orb: "bg-red-500/10", badge: "bg-red-500/10", icon: "text-red-500" },
  yellow: {
    orb: "bg-yellow-500/10",
    badge: "bg-yellow-500/10",
    icon: "text-yellow-500",
  },
  primary: { orb: "bg-primary/10", badge: "bg-primary/10", icon: "text-primary" },
}

// The one stat tile used across the admin dashboard, the user area and progress.
// `color` drives the orb, icon badge and icon tint together; an optional `href`
// turns the whole card into a link.
export function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  href,
  subtitle,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  href?: string
  subtitle?: string
}) {
  const colors = colorMap[color] ?? colorMap.primary

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-[30px] transition-opacity duration-300 group-hover:opacity-70",
          colors.orb,
        )}
      />
      <div className="relative flex flex-col gap-3">
        <div
          className={cn("inline-flex w-fit rounded-xl p-2 sm:p-2.5", colors.badge)}
        >
          <Icon
            className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.icon)}
            strokeWidth={1.5}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-0.5 truncate text-2xl font-bold tabular-nums sm:text-3xl">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link to={href as LinkProps["to"]}>{content}</Link>
  }

  return content
}

import type { LucideIcon } from "lucide-react"

const colorMap: Record<string, { orb: string; badge: string }> = {
  yellow: {
    orb: "bg-yellow-500/10",
    badge: "bg-yellow-500/10",
  },
  green: {
    orb: "bg-green-500/10",
    badge: "bg-green-500/10",
  },
  blue: {
    orb: "bg-blue-500/10",
    badge: "bg-blue-500/10",
  },
  purple: {
    orb: "bg-purple-500/10",
    badge: "bg-purple-500/10",
  },
  primary: {
    orb: "bg-primary/10",
    badge: "bg-primary/10",
  },
}

export function UserStatsCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg = "primary",
}: {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg?: string
}) {
  const colors = colorMap[iconBg] ?? colorMap.primary

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
      {/* Decorative blur orb */}
      <div
        className={`pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full ${colors.orb} blur-[30px] transition-opacity duration-300 group-hover:opacity-70`}
      />

      <div className="relative flex flex-col gap-3">
        <div
          className={`inline-flex w-fit rounded-xl ${colors.badge} p-2 sm:p-2.5`}
        >
          <Icon
            className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`}
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
        </div>
      </div>
    </div>
  )
}

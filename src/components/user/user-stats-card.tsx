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
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative blur orb */}
      <div
        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${colors.orb} blur-[30px] transition-opacity duration-300 group-hover:opacity-70`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`rounded-2xl ${colors.badge} p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}

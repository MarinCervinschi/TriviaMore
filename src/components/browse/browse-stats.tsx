import { Badge } from "@/components/ui/badge"

export function BrowseStats({
  stats,
}: {
  stats: { label: string; value: number }[]
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {stats.map((stat) => (
        <Badge key={stat.label} variant="secondary" className="text-sm">
          {stat.value} {stat.label}
        </Badge>
      ))}
    </div>
  )
}

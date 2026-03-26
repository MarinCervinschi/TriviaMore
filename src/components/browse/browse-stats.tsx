export function BrowseStats({
  stats,
}: {
  stats: { label: string; value: number }[]
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {stats.map((stat, i) => (
        <span key={stat.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="mr-2 h-1 w-1 rounded-full bg-muted-foreground/30" />}
          <span className="font-semibold text-foreground">{stat.value}</span>
          {stat.label}
        </span>
      ))}
    </div>
  )
}

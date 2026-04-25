import type { LucideIcon } from "lucide-react"

export function BrowseHero({
  icon: Icon,
  title,
  description,
  stats,
}: {
  icon: LucideIcon
  title: string
  description: string
  stats?: { label: string; value: number }[]
}) {
  return (
    <section className="relative w-full py-12 sm:py-16">
      <div className="container">
        <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-3">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>

        {stats && stats.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-6">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="mr-4 hidden h-1 w-1 rounded-full bg-muted-foreground/30 sm:block" />
                )}
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

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
    <section className="relative w-full overflow-hidden py-12 sm:py-16">
      {/* Mesh gradient bg — full viewport width */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
        <div className="absolute -left-32 top-0 h-[300px] w-[300px] rounded-full bg-primary/8 blur-[80px]" />
        <div className="absolute -right-20 bottom-0 h-[200px] w-[200px] rounded-full bg-orange-300/10 blur-[60px] dark:bg-orange-500/8" />
        <div className="absolute inset-0 dot-pattern opacity-50" />
      </div>

      {/* Content constrained to container */}
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

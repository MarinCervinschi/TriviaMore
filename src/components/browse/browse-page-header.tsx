import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export function BrowsePageHeader({
  breadcrumb,
  icon: Icon,
  title,
  description,
  badges,
  stats,
  actions,
}: {
  breadcrumb?: ReactNode
  icon?: LucideIcon
  title: string
  description?: string | null
  badges?: ReactNode
  stats?: { label: string; value: number }[]
  actions?: ReactNode
}) {
  return (
    <section className="relative w-full pb-10 pt-6 sm:pb-14 sm:pt-8">
      <div className="container">
        {breadcrumb}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {Icon && (
              <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-3">
                <Icon
                  className="h-7 w-7 text-primary"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            )}
            {badges && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {badges}
              </div>
            )}
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
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
    </section>
  )
}

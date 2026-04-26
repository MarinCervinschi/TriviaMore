import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { ExpandableDescription } from "./expandable-description"

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

        {/* Top row: icon left, actions right. On mobile, actions wrap below
            so the title block underneath always has full width and never gets
            squeezed by buttons. */}
        {(Icon || actions) && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {Icon ? (
              <div className="inline-flex shrink-0 rounded-2xl bg-primary/10 p-3">
                <Icon
                  className="h-6 w-6 text-primary sm:h-7 sm:w-7"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            ) : (
              <span aria-hidden />
            )}
            {actions && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {actions}
              </div>
            )}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description && (
            <ExpandableDescription
              text={description}
              className="mt-3 max-w-2xl"
              textClassName="text-base sm:text-lg"
            />
          )}
          {badges && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {badges}
            </div>
          )}
          {stats && stats.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="mr-4 hidden h-1 w-1 rounded-full bg-muted-foreground/30 sm:block"
                    />
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
      </div>
    </section>
  )
}

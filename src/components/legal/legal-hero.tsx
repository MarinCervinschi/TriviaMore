import type { LucideIcon } from "lucide-react"
import { CalendarClock, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface LegalHeroProps {
  icon: LucideIcon
  title: string
  description: string
  version: string
  lastUpdated: string
}

/**
 * Hero block shown above each legal document. Provides at-a-glance
 * metadata (version, last-updated date) so users who re-accept after
 * a version bump immediately see what document they are viewing.
 */
export function LegalHero({
  icon: Icon,
  title,
  description,
  version,
  lastUpdated,
}: LegalHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-[80px]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-orange-300/10 blur-[60px]" />
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-40" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1 font-mono text-xs"
            >
              <Tag className="h-3 w-3" />
              Versione {version}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-border/80 bg-background/60 px-3 py-1 text-xs font-normal text-muted-foreground"
            >
              <CalendarClock className="h-3 w-3" />
              Ultimo aggiornamento: {lastUpdated}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

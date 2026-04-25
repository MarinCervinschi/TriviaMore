import type { LucideIcon } from "lucide-react"
import { CalendarClock, Tag } from "lucide-react"

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
    <div className="space-y-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-mono">
          <Tag className="h-3 w-3" />
          Versione {version}
        </span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3 w-3" />
          Aggiornato il {lastUpdated}
        </span>
      </div>
    </div>
  )
}

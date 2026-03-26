import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function UserEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card p-12">
      {/* Decorative orb */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />

      <div className="relative text-center">
        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-4">
          <Icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        <p className="mb-6 text-muted-foreground">{description}</p>
        {actionLabel && actionHref && (
          <Button asChild className="shadow-lg shadow-primary/25">
            <Link to={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

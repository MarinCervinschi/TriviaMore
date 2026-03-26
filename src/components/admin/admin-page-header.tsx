import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type AdminPageHeaderProps = {
  title: string
  description?: string
  icon?: LucideIcon
  backTo?: string
  backParams?: Record<string, string>
  backLabel?: string
  actions?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  backTo,
  backParams,
  backLabel,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 border-b border-border/50 pb-6">
      {backTo && (
        <div className="mb-4">
          {backLabel && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {backLabel}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 rounded-xl"
            asChild
          >
            <Link to={backTo} params={backParams}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Indietro
            </Link>
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="inline-flex rounded-2xl bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

type AdminPageHeaderProps = {
  title: string
  description?: string
  backTo?: string
  backParams?: Record<string, string>
  backLabel?: string
  actions?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  backTo,
  backParams,
  backLabel,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      {backTo && (
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to={backTo} params={backParams}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            {backLabel ?? "Indietro"}
          </Link>
        </Button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

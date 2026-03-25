import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
    <Card>
      <CardContent className="p-12">
        <div className="text-center">
          <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{title}</h2>
          <p className="mb-4 text-muted-foreground">{description}</p>
          {actionLabel && actionHref && (
            <Button asChild>
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

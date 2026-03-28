import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ContentRequestStatus } from "@/lib/requests/types"

const statusConfig: Record<
  ContentRequestStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "In attesa",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  APPROVED: {
    label: "Approvata",
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
  },
  REJECTED: {
    label: "Rifiutata",
    className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  NEEDS_REVISION: {
    label: "Da revisionare",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
}

export function RequestStatusBadge({ status }: { status: ContentRequestStatus }) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  )
}

import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"

export function UserEmptyState({
  icon,
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
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  )
}

import { FileUp, Flag, FolderPlus, MessageSquarePlus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ContentRequestType } from "@/lib/requests/types"
import type { LucideIcon } from "lucide-react"

const typeConfig: Record<
  ContentRequestType,
  { label: string; icon: LucideIcon; className: string }
> = {
  NEW_SECTION: {
    label: "Nuova sezione",
    icon: FolderPlus,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  NEW_QUESTIONS: {
    label: "Nuove domande",
    icon: MessageSquarePlus,
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  REPORT: {
    label: "Segnalazione",
    icon: Flag,
    className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  FILE_UPLOAD: {
    label: "File caricato",
    icon: FileUp,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
}

export function RequestTypeBadge({ type }: { type: ContentRequestType }) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 rounded-full text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="size-3" strokeWidth={1.5} />
      {config.label}
    </Badge>
  )
}

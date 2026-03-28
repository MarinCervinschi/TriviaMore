import type { FolderPlus } from "lucide-react"

import { cn } from "@/lib/utils"

export function TypeCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: typeof FolderPlus
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-transparent bg-muted/50 hover:bg-accent/50",
      )}
    >
      <div className={cn("rounded-xl p-2", selected ? "bg-primary/10" : "bg-muted")}>
        <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

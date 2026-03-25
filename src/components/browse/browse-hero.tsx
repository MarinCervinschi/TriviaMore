import type { LucideIcon } from "lucide-react"

export function BrowseHero({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
    </div>
  )
}

import { SearchX } from "lucide-react"

export function BrowseEmptyState({
  message = "Nessun risultato trovato.",
}: {
  message?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  )
}

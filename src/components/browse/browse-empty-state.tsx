import { SearchX } from "lucide-react"

export function BrowseEmptyState({
  message = "Nessun risultato trovato.",
}: {
  message?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 inline-flex rounded-2xl bg-muted p-4">
        <SearchX className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      <p className="mb-1 text-lg font-medium text-muted-foreground">
        {message}
      </p>
      <p className="text-sm text-muted-foreground/60">
        Prova a cercare qualcos&apos;altro
      </p>
    </div>
  )
}

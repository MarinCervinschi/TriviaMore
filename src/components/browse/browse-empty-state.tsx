import { SearchX } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"

export function BrowseEmptyState({
  message = "Nessun risultato trovato.",
}: {
  message?: string
}) {
  return (
    <EmptyState
      icon={SearchX}
      title={message}
      description="Prova a cercare qualcos'altro"
    />
  )
}

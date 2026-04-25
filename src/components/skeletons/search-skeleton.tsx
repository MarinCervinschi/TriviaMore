import { Skeleton } from "@/components/ui/skeleton"

export function SearchResultsSkeleton({
  rows = 5,
}: {
  rows?: number
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-3"
    >
      <span className="sr-only">Caricamento risultati…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  )
}

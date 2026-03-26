import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function LoadingPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" text="Caricamento..." />
    </div>
  )
}

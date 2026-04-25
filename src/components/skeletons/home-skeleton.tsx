import { Skeleton } from "@/components/ui/skeleton"

export function PlatformStatsSectionSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Caricamento statistiche…"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      {/* Decorative orbs — match PlatformStatsSection */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/3 h-[350px] w-[350px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute -right-32 bottom-1/4 h-[300px] w-[300px] rounded-full bg-blue-400/8 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 space-y-3 text-center">
          <Skeleton className="mx-auto h-4 w-56 rounded-md" />
          <Skeleton className="mx-auto h-9 w-2/3 max-w-xl sm:h-10" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
          <Skeleton className="mx-auto h-5 w-3/4 max-w-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 text-center sm:p-8"
            >
              <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-2xl" />
              <Skeleton className="mx-auto h-10 w-20 sm:h-12" />
              <Skeleton className="mx-auto mt-2 h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

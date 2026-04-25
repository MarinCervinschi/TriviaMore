import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonHero, SkeletonRoot } from "./primitives"

function DepartmentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Area banner */}
      <div className="flex items-center gap-2.5 bg-muted/40 px-5 py-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
      </div>
      {/* Body */}
      <div className="space-y-2.5 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center gap-4 border-t pt-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

export function BrowseOverviewSkeleton() {
  return (
    <SkeletonRoot label="Caricamento panoramica…">
      <SkeletonHero />

      {/* Hero + toolbar + grid (single tight block) */}
      <section className="container pt-10 pb-12 sm:pt-14">
        <div className="space-y-3">
          <Skeleton className="h-13 w-13 rounded-2xl" />
          <Skeleton className="h-10 w-2/3 max-w-md" />
          <Skeleton className="h-5 w-3/4 max-w-lg" />
        </div>

        <div className="mt-8 space-y-3">
          <Skeleton className="h-11 w-full rounded-md" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DepartmentCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Hierarchy diagram band */}
      <section className="relative py-14 sm:py-20">
        <div className="container">
          <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
            <Skeleton className="mx-auto h-3 w-32" />
            <Skeleton className="mx-auto h-8 w-3/4" />
            <Skeleton className="mx-auto h-4 w-2/3" />
          </div>
          {/* Mobile: vertical stack */}
          <div className="mx-auto flex max-w-xs flex-col items-center gap-3 lg:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
          {/* Desktop: horizontal */}
          <div className="hidden gap-2 lg:flex xl:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 flex-1 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Bento data section */}
      <section className="container pb-16 pt-4">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-3 w-32" />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Skeleton className="h-8 w-1/2 max-w-md" />
            <Skeleton className="h-5 w-64 max-w-full" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Row 1: Map (cs2) + Course donut */}
          <div className="lg:col-span-2">
            <Skeleton className="h-full min-h-[380px] w-full rounded-2xl" />
          </div>
          <Skeleton className="h-full min-h-[380px] w-full rounded-2xl" />
          {/* Row 2: Department bar (cs2) + Question donut */}
          <div className="lg:col-span-2">
            <Skeleton className="h-full min-h-[460px] w-full rounded-2xl" />
          </div>
          <Skeleton className="h-full min-h-[460px] w-full rounded-2xl" />
          {/* Row 3: Campus radial + Top classes (cs2) */}
          <Skeleton className="h-full min-h-[320px] w-full rounded-2xl" />
          <div className="lg:col-span-2">
            <Skeleton className="h-full min-h-[320px] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    </SkeletonRoot>
  )
}

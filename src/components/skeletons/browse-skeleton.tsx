import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonChart,
  SkeletonHero,
  SkeletonRoot,
  SkeletonStatBlock,
} from "./primitives"

export function BrowseChartSkeleton({ height = 300 }: { height?: number }) {
  return <SkeletonChart height={height} />
}

export function BrowseOverviewSkeleton() {
  return (
    <SkeletonRoot label="Caricamento panoramica…">
      <SkeletonHero />

      {/* Stats */}
      <section className="container py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatBlock key={i} />
          ))}
        </div>
      </section>

      {/* Navigation card */}
      <section className="container pb-4">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </section>

      {/* Charts section */}
      <section className="container py-8">
        <Skeleton className="mb-6 h-7 w-56" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonChart height={300} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <SkeletonChart height={300} />
            <SkeletonChart height={300} />
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="container py-8">
        <SkeletonChart height={360} />
      </section>
    </SkeletonRoot>
  )
}


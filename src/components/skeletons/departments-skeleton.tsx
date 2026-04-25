import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonBadge,
  SkeletonChart,
  SkeletonFilterBar,
  SkeletonRoot,
  SkeletonSearchInput,
  SkeletonTable,
} from "./primitives"

function BrowsePageHeaderSkeleton({
  badges = 2,
  stats = 1,
  withActions = true,
}: {
  badges?: number
  stats?: number
  withActions?: boolean
}) {
  return (
    <section className="relative w-full pt-8 pb-10 sm:pt-12">
      <div className="container">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-5/6 max-w-lg" />
              <div className="flex flex-wrap gap-2 pt-1">
                {Array.from({ length: badges }).map((_, i) => (
                  <SkeletonBadge key={i} />
                ))}
              </div>
            </div>
          </div>
          {withActions && (
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          )}
        </div>

        {stats > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-6">
            {Array.from({ length: stats }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function DepartmentDetailSkeleton() {
  return (
    <SkeletonRoot label="Caricamento dipartimento…" className="pb-8">
      <BrowsePageHeaderSkeleton badges={3} stats={1} />
      <div className="container">
        {/* Map */}
        <SkeletonChart className="mb-6" height={300} />

        <SkeletonFilterBar chips={4} />
        <SkeletonSearchInput className="mb-6" />

        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <section key={i}>
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <SkeletonTable rows={5} columns={5} />
            </section>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function CourseDetailSkeleton() {
  return (
    <SkeletonRoot label="Caricamento corso…" className="pb-8">
      <BrowsePageHeaderSkeleton badges={3} stats={1} />
      <div className="container pt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <SkeletonFilterBar chips={4} />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <SkeletonSearchInput className="mb-6" />

        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <section key={i}>
              <Skeleton className="mb-4 h-5 w-24" />
              <SkeletonTable rows={6} columns={4} />
            </section>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function ClassDetailSkeleton() {
  return (
    <SkeletonRoot label="Caricamento insegnamento…" className="pb-8">
      <BrowsePageHeaderSkeleton badges={5} stats={2} />
      <div className="container pt-8">
        {/* Exam simulation banner */}
        <div className="mb-6 rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="flex flex-wrap gap-2">
                  <SkeletonBadge className="w-20" />
                  <SkeletonBadge className="w-24" />
                </div>
              </div>
            </div>
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        <SkeletonSearchInput className="mb-6" />
        <SkeletonTable rows={6} columns={4} />
      </div>
    </SkeletonRoot>
  )
}

export function SectionDetailSkeleton() {
  return (
    <SkeletonRoot label="Caricamento sezione…" className="pb-8">
      <BrowsePageHeaderSkeleton badges={3} stats={0} />
      <div className="container pt-8">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonChart,
  SkeletonHero,
  SkeletonRoot,
  SkeletonStatBlock,
  SkeletonTable,
} from "./primitives"

function UserBreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function UserDashboardSkeleton() {
  return (
    <SkeletonRoot label="Caricamento dashboard…" className="space-y-8 pb-8">
      {/* Custom hero with avatar */}
      <section className="relative w-full py-12 sm:py-16">
        <div className="container">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-9 w-2/3 sm:h-11" />
              <Skeleton className="h-7 w-32 rounded-full" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatBlock key={i} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <Skeleton className="mb-4 h-12 w-12 rounded-2xl" />
              <Skeleton className="mb-2 h-5 w-2/3" />
              <Skeleton className="mb-1 h-3.5 w-full" />
              <Skeleton className="mb-4 h-3.5 w-5/6" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Recent classes */}
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-64" />
          <SkeletonTable rows={3} columns={4} />
        </div>

        {/* Recent activity */}
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-72" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-2 text-right">
                    <Skeleton className="ml-auto h-5 w-12 rounded-full" />
                    <Skeleton className="ml-auto h-3 w-16" />
                  </div>
                  <Skeleton className="h-9 w-16 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function ProgressSkeleton() {
  return (
    <SkeletonRoot label="Caricamento progressi…" className="space-y-8 pb-8">
      <SkeletonHero withStats={3} />

      <div className="container space-y-8">
        <UserBreadcrumbSkeleton />

        {/* Progress stats grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <Skeleton className="mb-4 h-4 w-1/2" />
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="mx-auto mt-4 h-5 w-24" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl bg-muted/50 p-1">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-1/3" />
            <SkeletonChart height={280} />
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-1/3" />
            <SkeletonChart height={280} />
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-1/3" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function BookmarksSkeleton() {
  return (
    <SkeletonRoot label="Caricamento segnalibri…" className="space-y-8 pb-8">
      <SkeletonHero withStats={1} />

      <div className="container space-y-6">
        <UserBreadcrumbSkeleton />

        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="flex items-center justify-between gap-3 p-4">
                <Skeleton className="h-4 w-2/3" />
                <div className="flex shrink-0 items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function UserClassesSkeleton() {
  return (
    <SkeletonRoot label="Caricamento corsi…" className="space-y-8 pb-8">
      <SkeletonHero withStats={2} />

      <div className="container space-y-6">
        <UserBreadcrumbSkeleton />

        {/* Search + filters toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <SkeletonTable rows={6} columns={5} />
      </div>
    </SkeletonRoot>
  )
}

export function NotificationsSkeleton() {
  return (
    <SkeletonRoot label="Caricamento notifiche…" className="space-y-8 pb-8">
      <SkeletonHero />

      <div className="container">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl border bg-card p-4"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3.5 w-full max-w-md" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function UserRequestsSkeleton() {
  return (
    <SkeletonRoot label="Caricamento contributi…" className="space-y-8 pb-8">
      <SkeletonHero />

      <div className="container max-w-3xl space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  )
}

export function SettingsSkeleton() {
  return (
    <SkeletonRoot label="Caricamento impostazioni…" className="space-y-8 pb-8">
      <SkeletonHero />

      <div className="container space-y-6">
        <UserBreadcrumbSkeleton />

        {/* Profile form */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <Skeleton className="mb-2 h-6 w-1/3" />
          <Skeleton className="mb-6 h-4 w-1/2" />

          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <Skeleton className="mt-6 h-10 w-36 rounded-xl" />
        </div>

        {/* Stats */}
        <div>
          <Skeleton className="mb-1 h-6 w-48" />
          <Skeleton className="mb-4 h-4 w-2/3" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatBlock key={i} />
            ))}
          </div>
        </div>

        {/* Account details */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-1/2" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonRoot>
  )
}

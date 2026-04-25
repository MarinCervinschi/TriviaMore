import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Common = { className?: string }

/**
 * Root wrapper for page-level skeletons. Announces a busy state to assistive
 * tech and provides a visually hidden status message for screen readers.
 */
export function SkeletonRoot({
  children,
  className,
  label = "Caricamento in corso…",
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function SkeletonText({
  className,
  width = "100%",
}: Common & { width?: string | number }) {
  return (
    <Skeleton
      className={cn("h-4", className)}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    />
  )
}

export function SkeletonHeading({
  className,
  level = "h1",
}: Common & { level?: "h1" | "h2" | "h3" }) {
  const heights = { h1: "h-10 sm:h-12", h2: "h-7", h3: "h-5" } as const
  const widths = { h1: "w-2/3", h2: "w-1/2", h3: "w-1/3" } as const
  return <Skeleton className={cn(heights[level], widths[level], className)} />
}

export function SkeletonBadge({ className }: Common) {
  return <Skeleton className={cn("h-5 w-16 rounded-full", className)} />
}

export function SkeletonButton({
  className,
  width = "w-28",
}: Common & { width?: string }) {
  return <Skeleton className={cn("h-9 rounded-xl", width, className)} />
}

export function SkeletonAvatar({
  className,
  size = 40,
}: Common & { size?: number }) {
  return (
    <Skeleton
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    />
  )
}

export function SkeletonHero({
  withStats = 0,
  withBadges = 0,
  withBreadcrumb = false,
}: {
  withStats?: number
  withBadges?: number
  withBreadcrumb?: boolean
}) {
  return (
    <section className="relative w-full py-12 sm:py-16">
      <div className="container">
        {withBreadcrumb && <Skeleton className="mb-4 h-4 w-48 rounded-md" />}
        <Skeleton className="mb-3 h-12 w-12 rounded-2xl" />
        <Skeleton className="mb-3 h-9 w-2/3 sm:h-12" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-5 w-1/2" />

        {withBadges > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: withBadges }).map((_, i) => (
              <SkeletonBadge key={i} className="h-6 w-20" />
            ))}
          </div>
        )}

        {withStats > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-6">
            {Array.from({ length: withStats }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-7 w-12 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function SkeletonStatBlock({ className }: Common) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGridCard({ className }: Common) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card shadow-sm",
        className,
      )}
    >
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="flex flex-col gap-4 p-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap gap-2">
              <SkeletonBadge className="w-12" />
              <SkeletonBadge className="w-20" />
            </div>
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <div className="mt-auto flex items-center gap-4 border-t pt-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonChart({
  className,
  height = 300,
}: Common & { height?: number }) {
  return (
    <Skeleton
      className={cn("w-full rounded-2xl", className)}
      style={{ height }}
    />
  )
}

export function SkeletonTable({
  rows = 6,
  columns = 5,
  className,
}: Common & { rows?: number; columns?: number }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        className,
      )}
    >
      {/* Header */}
      <div
        className="grid gap-4 border-b bg-muted/30 px-6 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-3/4" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid gap-4 px-6 py-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((__, c) => (
              <Skeleton
                key={c}
                className={cn("h-4", c === 0 ? "w-5/6" : "w-1/2")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonListRow({
  className,
  withTrailing = true,
}: Common & { withTrailing?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border bg-card p-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      {withTrailing && (
        <div className="flex shrink-0 items-center gap-2">
          <SkeletonBadge className="w-16" />
          <SkeletonBadge className="w-12" />
        </div>
      )}
    </div>
  )
}

export function SkeletonFilterBar({ chips = 4 }: { chips?: number }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {Array.from({ length: chips }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  )
}

export function SkeletonSearchInput({ className }: Common) {
  return (
    <Skeleton className={cn("h-11 w-full rounded-xl", className)} />
  )
}

export function SkeletonBreadcrumb() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

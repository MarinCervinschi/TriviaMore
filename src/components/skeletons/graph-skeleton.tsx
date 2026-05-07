import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonRoot } from "./primitives"

export function GraphPageSkeleton() {
  return (
    <SkeletonRoot
      label="Caricamento mappa…"
      className="relative h-[calc(100vh-4rem)] w-full overflow-hidden"
    >
      {/* Static header — same copy as the loaded page */}
      <header className="pointer-events-none relative z-10 max-w-2xl p-6 sm:p-10">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Mappa dei contenuti
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          La rete UniMore su TriviaMore
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          13 dipartimenti e 96 corsi collegati. Passa il mouse su un nodo per
          vederne i dettagli, clicca per fissare la selezione.
        </p>
      </header>

      {/* Decorative graph silhouette */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[60vh] w-[60vh] max-h-[600px] max-w-[600px]">
          {/* Center cluster of nodes */}
          {Array.from({ length: 13 }).map((_, i) => {
            const angle = (i / 13) * Math.PI * 2
            const radius = 120
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            return (
              <Skeleton
                key={`d-${i}`}
                className="absolute h-5 w-5 rounded-full"
                style={{
                  left: `calc(50% + ${x}px - 10px)`,
                  top: `calc(50% + ${y}px - 10px)`,
                }}
              />
            )
          })}
          {/* Outer ring of smaller nodes */}
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i / 32) * Math.PI * 2 + 0.1
            const radius = 240 + (i % 3) * 20
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            return (
              <Skeleton
                key={`c-${i}`}
                className="absolute h-2.5 w-2.5 rounded-full opacity-60"
                style={{
                  left: `calc(50% + ${x}px - 5px)`,
                  top: `calc(50% + ${y}px - 5px)`,
                }}
              />
            )
          })}
        </div>
      </div>
    </SkeletonRoot>
  )
}

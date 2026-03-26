import { cn } from "@/lib/utils"
import type { FeatureCard } from "./data"

function FeatureCardComponent({
  feature,
  className,
}: {
  feature: FeatureCard
  className?: string
}) {
  const Icon = feature.icon
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8",
        className
      )}
    >
      {/* Subtle gradient accent on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div className={`mb-4 inline-flex rounded-2xl p-3 ${feature.iconBg}`}>
        <Icon className={`h-7 w-7 ${feature.iconColor}`} strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">
        {feature.title}
      </h3>
      <p className="leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  )
}

export function FeaturesSection({ features }: { features: FeatureCard[] }) {
  return (
    <section className="relative py-20 sm:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="absolute inset-0 dot-pattern opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Funzionalita'
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Tutto quello che ti serve
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Strumenti pensati per uno studio efficace e una preparazione
            ottimale agli esami.
          </p>
        </div>

        {/* Bento-style grid: 2 large + 2 small */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <FeatureCardComponent
              key={feature.title}
              feature={feature}
              className={i < 2 ? "md:min-h-[220px]" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

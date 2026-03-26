import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { HeroContent } from "./data"

export function HeroSection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}: HeroContent) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Decorative background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(10 76% 42% / 0.06), transparent 70%)",
        }}
      />

      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="gradient-text mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {subtitle}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" className="px-8 shadow-lg" asChild>
            <Link to={primaryCTA.href}>
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8"
            asChild
          >
            <Link to={secondaryCTA.href}>{secondaryCTA.text}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

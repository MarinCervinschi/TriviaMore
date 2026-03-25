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
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mb-8 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {subtitle}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" className="px-8" asChild>
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

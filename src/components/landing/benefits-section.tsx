import { Link } from "@tanstack/react-router"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BenefitItem, CTACardProps } from "./data"

function BenefitItemComponent({ benefit }: { benefit: BenefitItem }) {
  return (
    <div className="flex items-start gap-4">
      <div className="inline-flex shrink-0 rounded-full bg-green-500/10 p-1.5">
        <CheckCircle className="h-5 w-5 text-green-500" />
      </div>
      <div>
        <h3 className="font-semibold">{benefit.title}</h3>
        <p className="text-sm text-muted-foreground">{benefit.description}</p>
      </div>
    </div>
  )
}

function CTACard({
  title,
  description,
  buttonText,
  buttonHref,
  secondaryButtonText,
  secondaryButtonHref,
  disclaimer,
}: CTACardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-muted-foreground">{description}</p>
        <div className="space-y-3">
          <Button size="lg" className="w-full shadow-lg" asChild>
            <Link to={buttonHref}>{buttonText}</Link>
          </Button>
          {secondaryButtonText && secondaryButtonHref && (
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              asChild
            >
              <a
                href={secondaryButtonHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {secondaryButtonText}
              </a>
            </Button>
          )}
        </div>
        {disclaimer && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {disclaimer}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function BenefitsSection({
  benefits,
  ctaCard,
}: {
  benefits: BenefitItem[]
  ctaCard: CTACardProps
}) {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-8 text-3xl font-bold tracking-tight">
              Perché gli studenti scelgono Trivia More
            </h2>
            <div className="space-y-5">
              {benefits.map((benefit) => (
                <BenefitItemComponent key={benefit.title} benefit={benefit} />
              ))}
            </div>
          </div>
          <CTACard {...ctaCard} />
        </div>
      </div>
    </section>
  )
}

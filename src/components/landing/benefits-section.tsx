import { Link } from "@tanstack/react-router"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BenefitItem, CTACardProps } from "./data"

function BenefitItemComponent({ benefit }: { benefit: BenefitItem }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
      <div>
        <h3 className="font-semibold">{benefit.title}</h3>
        <p className="text-muted-foreground">{benefit.description}</p>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-muted-foreground">{description}</p>
        <div className="space-y-3">
          <Button size="lg" className="w-full" asChild>
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold">
              Perché gli studenti scelgono Trivia More
            </h2>
            <div className="space-y-4">
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

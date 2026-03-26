import { createFileRoute } from "@tanstack/react-router"
import { websiteJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"

import {
  BenefitsSection,
  FeaturesSection,
  HeroSection,
  benefits,
  ctaCardContent,
  features,
  heroContent,
} from "@/components/landing"

export const Route = createFileRoute("/_app/")({
  head: () => ({
    ...seoHead({
      title: "TriviaMore",
      description:
        "La piattaforma di quiz e flashcard per studiare meglio. Creata da studenti per studenti.",
      path: "/",
    }),
    scripts: [websiteJsonLd()],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <HeroSection {...heroContent} />
      <FeaturesSection features={features} />
      <BenefitsSection benefits={benefits} ctaCard={ctaCardContent} />
    </>
  )
}

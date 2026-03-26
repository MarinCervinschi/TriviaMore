import { createFileRoute } from "@tanstack/react-router"

import {
  BenefitsSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  benefits,
  ctaCardContent,
  features,
  footerSections,
  heroContent,
} from "@/components/landing"

export const Route = createFileRoute("/_app/")({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <HeroSection {...heroContent} />
      <FeaturesSection features={features} />
      <BenefitsSection benefits={benefits} ctaCard={ctaCardContent} />
      <LandingFooter sections={footerSections} />
    </>
  )
}

import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { websiteJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { browseQueries } from "@/lib/browse/queries"
import { getSessionFn } from "@/lib/auth/server"

import {
  BenefitsSection,
  ContentExplorer,
  FeatureShowcase,
  HeroSection,
  PlatformStatsSection,
  benefits,
  ctaCardContent,
  heroContent,
  showcaseFeatures,
} from "@/components/landing"

export const Route = createFileRoute("/_app/")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["auth", "session"],
      queryFn: () => getSessionFn(),
    })
    if (session) {
      throw redirect({ to: "/user" })
    }
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.platformStats()),
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
  const { data: stats } = useSuspenseQuery(browseQueries.platformStats())

  return (
    <>
      <HeroSection {...heroContent} />
      <FeatureShowcase features={showcaseFeatures} />
      <ContentExplorer />
      <PlatformStatsSection stats={stats} />
      <BenefitsSection benefits={benefits} ctaCard={ctaCardContent} />
    </>
  )
}

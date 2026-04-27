import { Suspense } from "react"
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
import { PlatformStatsSectionSkeleton } from "@/components/skeletons"

export const Route = createFileRoute("/_app/")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["auth", "session"],
      queryFn: () => getSessionFn(),
    })
    if (session) {
      throw redirect({ to: "/user" })
    }
    // Fire-and-forget prefetch — does not block route render so the static
    // landing renders immediately; the stats section uses Suspense locally.
    void context.queryClient.prefetchQuery(browseQueries.platformStats())
  },
  head: () => ({
    ...seoHead({
      title: "Studia gli esami UniMore in modo organizzato",
      description:
        "Catalogo completo dell'ateneo UniMore organizzato per dipartimento, corso e insegnamento. Quiz interattivi, simulazioni d'esame, flashcard e dashboard personale. Open source, curato dalla community.",
      path: "/",
      jsonLd: websiteJsonLd(),
    }),
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <HeroSection {...heroContent} />
      <FeatureShowcase features={showcaseFeatures} />
      <ContentExplorer />
      <Suspense fallback={<PlatformStatsSectionSkeleton />}>
        <PlatformStatsAsync />
      </Suspense>
      <BenefitsSection benefits={benefits} ctaCard={ctaCardContent} />
    </>
  )
}

function PlatformStatsAsync() {
  const { data: stats } = useSuspenseQuery(browseQueries.platformStats())
  return <PlatformStatsSection stats={stats} />
}

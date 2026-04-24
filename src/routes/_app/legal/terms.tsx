import { createFileRoute } from "@tanstack/react-router"
import { Scale } from "lucide-react"

import { LegalDocLayout } from "@/components/legal/legal-doc-layout"
import { CURRENT_TERMS_VERSION } from "@/lib/legal/versions"
import { seoHead } from "@/lib/seo"
import termsMarkdown from "@/content/legal/terms.it.md?raw"

export const Route = createFileRoute("/_app/legal/terms")({
  head: () =>
    seoHead({
      title: "Termini e Condizioni",
      description:
        "Termini e Condizioni di utilizzo di TriviaMore, la piattaforma gratuita di quiz e flashcard per la preparazione universitaria.",
    }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <LegalDocLayout
      markdown={termsMarkdown}
      meta={{
        slug: "terms",
        title: "Termini e Condizioni",
        description:
          "Le regole che disciplinano l'utilizzo del Servizio TriviaMore. Ti consigliamo di leggerle con attenzione prima di creare un account.",
        icon: Scale,
        version: CURRENT_TERMS_VERSION,
        lastUpdated: "24 aprile 2026",
      }}
    />
  )
}

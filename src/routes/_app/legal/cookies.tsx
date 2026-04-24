import { createFileRoute } from "@tanstack/react-router"
import { Cookie } from "lucide-react"

import { LegalDocLayout } from "@/components/legal/legal-doc-layout"
import { CURRENT_COOKIE_POLICY_VERSION } from "@/lib/legal/versions"
import { seoHead } from "@/lib/seo"
import cookiesMarkdown from "@/content/legal/cookies.it.md?raw"

export const Route = createFileRoute("/_app/legal/cookies")({
  head: () =>
    seoHead({
      title: "Cookie Policy",
      description:
        "Cookie Policy di TriviaMore: quali cookie utilizziamo e come gestire il consenso.",
    }),
  component: CookiesPage,
})

function CookiesPage() {
  return (
    <LegalDocLayout
      markdown={cookiesMarkdown}
      meta={{
        slug: "cookies",
        title: "Cookie Policy",
        description:
          "I cookie tecnici e analitici utilizzati dal Servizio, in linea con le linee guida del Garante per la Protezione dei Dati Personali.",
        icon: Cookie,
        version: CURRENT_COOKIE_POLICY_VERSION,
        lastUpdated: "24 aprile 2026",
      }}
    />
  )
}

import { createFileRoute } from "@tanstack/react-router"
import { ShieldCheck } from "lucide-react"

import { LegalDocLayout } from "@/components/legal/legal-doc-layout"
import { CURRENT_PRIVACY_VERSION } from "@/lib/legal/versions"
import { seoHead } from "@/lib/seo"
import privacyMarkdown from "@/content/legal/privacy.it.md?raw"

export const Route = createFileRoute("/_app/legal/privacy")({
  head: () =>
    seoHead({
      title: "Informativa sulla Privacy",
      description:
        "Informativa sul trattamento dei dati personali degli utenti di TriviaMore ai sensi del GDPR.",
    }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <LegalDocLayout
      markdown={privacyMarkdown}
      meta={{
        slug: "privacy",
        title: "Informativa sulla Privacy",
        description:
          "Quali dati raccogliamo, perché li trattiamo, con chi li condividiamo e quali diritti ti riconosce il Regolamento UE 2016/679 (GDPR).",
        icon: ShieldCheck,
        version: CURRENT_PRIVACY_VERSION,
        lastUpdated: "24 aprile 2026",
      }}
    />
  )
}

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://www.trivia-more.it"
const SITE_NAME = "TriviaMore"

function jsonLdScript(data: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as React.JSX.IntrinsicElements["script"]
}

export function websiteJsonLd() {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "La piattaforma di quiz e flashcard per studiare meglio. Creata da studenti per studenti.",
    inLanguage: "it",
  })
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  })
}

export function courseJsonLd({
  name,
  description,
  path,
  provider,
}: {
  name: string
  description?: string
  path: string
  provider?: string
}) {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description: description ?? `Corso ${name} su ${SITE_NAME}`,
    url: `${SITE_URL}${path}`,
    provider: {
      "@type": "Organization",
      name: provider ?? SITE_NAME,
    },
  })
}

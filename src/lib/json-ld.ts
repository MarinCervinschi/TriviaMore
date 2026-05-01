const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://www.trivia-more.it"
const SITE_NAME = "TriviaMore"

export type JsonLd = Record<string, unknown>

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Catalogo completo dell'ateneo UniMore con quiz, simulazioni d'esame, flashcard e dashboard personale. Open source, curato dalla community.",
    inLanguage: "it",
  }
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
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
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description: description ?? `Corso ${name} su ${SITE_NAME}`,
    url: `${SITE_URL}${path}`,
    provider: {
      "@type": "Organization",
      name: provider ?? SITE_NAME,
    },
  }
}

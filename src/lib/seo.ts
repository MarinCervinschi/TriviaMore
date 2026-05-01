import type { JsonLd } from "./json-ld"

const SITE_NAME = "TriviaMore"
const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://www.trivia-more.it"
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

type SeoHeadOptions = {
  title: string
  description?: string
  path?: string
  type?: "website" | "article"
  image?: string
  noindex?: boolean
  jsonLd?: JsonLd | JsonLd[]
}

type MetaEntry = Record<string, unknown>

export function seoHead({
  title,
  description,
  path,
  type = "website",
  image,
  noindex,
  jsonLd,
}: SeoHeadOptions) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = path ? `${SITE_URL}${path}` : undefined
  const ogImage = image ?? DEFAULT_OG_IMAGE

  const meta: MetaEntry[] = [{ title: fullTitle }]

  if (description) {
    meta.push({ name: "description", content: description })
  }

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" })
  }

  if (!noindex) {
    meta.push(
      { property: "og:title", content: fullTitle },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: type },
      { property: "og:locale", content: "it_IT" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:image", content: ogImage },
    )
    if (description) {
      meta.push(
        { property: "og:description", content: description },
        { name: "twitter:description", content: description },
      )
    }
    if (canonicalUrl) {
      meta.push({ property: "og:url", content: canonicalUrl })
    }

    // TanStack Start reconnaissance pattern for SSR-rendered JSON-LD blocks.
    // See @tanstack/react-router headContentUtils — the "script:ld+json" key
    // is the only meta shape that emits <script type="application/ld+json">
    // inline in the SSR <head>.
    if (jsonLd) {
      const list = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
      for (const data of list) {
        meta.push({ "script:ld+json": data })
      }
    }
  }

  const links: Record<string, string>[] = []
  if (canonicalUrl && !noindex) {
    links.push({ rel: "canonical", href: canonicalUrl })
  }

  return { meta, links }
}
